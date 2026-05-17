import { ANIMELATINO_CONFIG } from "../../config/providerConfigs";
import { TIMEOUTS } from "../../config/timeouts";
import { ISession, IWebViewBridge, WebViewMessageData } from "../../domain/interfaces";
import { logger } from "../../utils/logger";
import { HLS_EXTRACT_JS, IFRAME_EXTRACT_JS } from "../webview/injectionScripts";

// ─── Internal types ────────────────────────────────────────────────────

type NavigateFn = (uri: string) => void;
type Resolver = (url: string | null) => void;

/**
 * Manages the logic for interacting with the WebView worker.
 * Decoupled from the React component state to allow for easier testing.
 */
export class WebViewBridge implements IWebViewBridge {
  private activeDecryptions = new Map<string, Resolver>();
  private navigateFn: NavigateFn | null = null;
  private injectFn: ((code: string) => void) | null = null;
  private pageLoadResolver: ((value: void) => void) | null = null;

  /**
   * Called by WebViewWorker to register its navigation capability.
   */
  registerNavigation(fn: NavigateFn) {
    this.navigateFn = fn;
  }

  /**
   * Called by WebViewWorker to register its JS injection capability.
   */
  registerInjection(fn: (code: string) => void) {
    this.injectFn = fn;
  }

  /**
   * Notifies the bridge that the WebView has finished loading a page.
   */
  notifyPageLoaded() {
    if (this.pageLoadResolver) {
      this.pageLoadResolver();
      this.pageLoadResolver = null;
    }
  }

  handleMessage(message: string): { type: string; data: WebViewMessageData } | null {
    try {
      const parsed = JSON.parse(message);

      // Handle legacy format (without type field) for backward compatibility
      if (!parsed.type && typeof parsed === "object") {
        return this.handleLegacyMessage(parsed);
      }

      const { type, data } = parsed;

      if (type === "DECRYPTION_RESULT") {
        let { id, data: url, error } = data;

        if (id === "stream_auto") {
          const keys = Array.from(this.activeDecryptions.keys());
          const lastRequestId = keys[keys.length - 1];
          if (lastRequestId) {
            id = lastRequestId;
          }
        }

        const resolve = this.activeDecryptions.get(id);
        if (resolve) {
          this.activeDecryptions.delete(id);
          logger.debug("WebViewBridge", `DECRYPTION_RESULT for ${id}: ${url ? "OK" : "null"} ${error || ""}`);
          resolve(url || null);
        }
      }

      if (type === "EMBED_VIDEO_URL") {
        const lastRequestId = Array.from(this.activeDecryptions.keys()).pop();
        if (lastRequestId) {
          const autoResolve = this.activeDecryptions.get(lastRequestId);
          logger.debug("WebViewBridge", `EMBED_VIDEO_URL intercepted: ${data.url}, resolving request: ${lastRequestId}`);
          if (autoResolve) {
            this.activeDecryptions.delete(lastRequestId);
            autoResolve(data.url);
          }
        }
      }

      return { type, data };
    } catch {
      return null;
    }
  }

  private handleLegacyMessage(parsed: unknown): { type: string; data: WebViewMessageData } | null {
    if (typeof parsed === "string") {
      const data: WebViewMessageData = { type: "RAW", data: parsed };
      return { type: "RAW", data };
    }

    if (typeof parsed === "object" && parsed !== null) {
      const obj = parsed as Record<string, unknown>;

      if ("id" in obj && "data" in obj) {
        const data: WebViewMessageData = {
          type: "DECRYPTION_RESULT",
          id: String(obj.id),
          data: obj.data as string | null,
          error: "error" in obj ? String(obj.error) : undefined,
        };
        return { type: "DECRYPTION_RESULT", data };
      }

      if ("cookies" in obj && "userAgent" in obj) {
        const data: WebViewMessageData = {
          type: "SESSION",
          session: obj as unknown as ISession,
        };
        return { type: "SESSION", data };
      }
    }

    return null;
  }

  async resolveStreamUrl(videoUrl: string, episodeUrl?: string): Promise<string | null> {
    if (!this.navigateFn) throw new Error("WebView navigation not registered");

    const requestId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.clearPendingRequests();

    // Derive session wash domain from the video URL to ensure cookies
    // are set for the correct subdomain (e.g., website.animelatinohd.com)
    const washDomain = this.extractOrigin(videoUrl);
    logger.debug("WebViewBridge", `Starting session wash: navigating to ${washDomain}...`);
    this.navigateFn(washDomain);

    try {
      await this.waitForPageLoad(TIMEOUTS.PAGE_LOAD);
      logger.debug("WebViewBridge", "Session wash complete.");
    } catch {
      logger.debug("WebViewBridge", "Session wash timed out or failed, proceeding anyway.");
    }

    if (episodeUrl) {
      logger.debug("WebViewBridge", `Navigating to episode page: ${episodeUrl}`);
      this.navigateFn(episodeUrl);

      try {
        await this.waitForPageLoad(TIMEOUTS.EPISODE_PAGE_LOAD);
        logger.debug("WebViewBridge", "Episode page loaded.");
      } catch {
        logger.debug("WebViewBridge", "Episode page load timed out, proceeding anyway.");
      }
    }

    const promise = this.timeoutPromise(requestId, TIMEOUTS.DECRYPTION);

    logger.debug("WebViewBridge", `Navigating to bridge URL: ${videoUrl}`);
    this.navigateFn(videoUrl);

    this.pollForIframe(requestId);

    const result = await promise;
    return result;
  }

  private extractOrigin(url: string): string {
    try {
      return new URL(url).origin;
    } catch {
      // Fallback to configured session wash URL if URL parsing fails
      return ANIMELATINO_CONFIG.sessionWashUrl;
    }
  }

  private clearPendingRequests(): void {
    for (const [id, resolve] of this.activeDecryptions) {
      resolve(null);
      this.activeDecryptions.delete(id);
    }
  }

  private timeoutPromise(requestId: string, timeoutMs: number): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      this.activeDecryptions.set(requestId, resolve);
      setTimeout(() => {
        if (this.activeDecryptions.has(requestId)) {
          this.activeDecryptions.delete(requestId);
          resolve(null);
        }
      }, timeoutMs);
    });
  }

  private waitForPageLoad(timeoutMs: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pageLoadResolver = null;
        reject(new Error("Page load timeout"));
      }, timeoutMs);

      this.pageLoadResolver = () => {
        clearTimeout(timer);
        resolve();
      };
    });
  }

  private pollForIframe(requestId: string): void {
    let attempts = 0;
    const maxAttempts = TIMEOUTS.IFRAME_POLL_MAX_ATTEMPTS;
    const interval = TIMEOUTS.IFRAME_POLL_INTERVAL;

    const poll = () => {
      if (!this.injectFn || !this.activeDecryptions.has(requestId)) return;

      attempts++;

      if (attempts > maxAttempts) {
        logger.debug("WebViewBridge", `Iframe extraction polling exhausted after ${maxAttempts} attempts`);
        return;
      }

      this.injectFn(IFRAME_EXTRACT_JS);

      // If not resolved yet, schedule next poll
      if (this.activeDecryptions.has(requestId)) {
        setTimeout(poll, interval);
      }
    };

    // Start polling after initial delay to let page begin loading
    setTimeout(poll, interval);
  }

  /**
   * Resolves a stream URL by navigating to an embed player page and
   * extracting the HLS (.m3u8) or MP4 video source from the DOM.
   */
  async resolveEmbedStreamUrl(embedUrl: string): Promise<string | null> {
    if (!this.navigateFn) throw new Error("WebView navigation not registered");

    const requestId = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.clearPendingRequests();

    const promise = this.timeoutPromise(requestId, TIMEOUTS.DECRYPTION);

    logger.debug("WebViewBridge", `Navigating to embed URL: ${embedUrl}`);
    this.navigateFn(embedUrl);

    try {
      await this.waitForPageLoad(TIMEOUTS.EMBED_PAGE_LOAD);
      logger.debug("WebViewBridge", "Embed page loaded, starting HLS extraction polling.");
    } catch {
      logger.debug("WebViewBridge", "Embed page load timed out, proceeding with extraction anyway.");
    }

    this.pollForHls(requestId);

    const result = await promise;
    return result;
  }

  private pollForHls(requestId: string): void {
    let attempts = 0;
    const maxAttempts = TIMEOUTS.IFRAME_POLL_MAX_ATTEMPTS;
    const interval = TIMEOUTS.IFRAME_POLL_INTERVAL;

    const poll = () => {
      if (!this.injectFn || !this.activeDecryptions.has(requestId)) return;

      attempts++;

      if (attempts > maxAttempts) {
        logger.debug("WebViewBridge", `HLS extraction polling exhausted after ${maxAttempts} attempts`);
        return;
      }

      this.injectFn(HLS_EXTRACT_JS);

      // If not resolved yet, schedule next poll
      if (this.activeDecryptions.has(requestId)) {
        setTimeout(poll, interval);
      }
    };

    // Start polling after initial delay to let SPA initialize video
    setTimeout(poll, interval);
  }
}
