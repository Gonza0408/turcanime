import { logger } from "../../../utils/logger";
import { BridgeMessage } from "./types";

export class MessageRouter {
  constructor(
    private activeDecryptions: Map<string, (url: string | null) => void>,
    private onStreamFound: (url: string) => void
  ) {}

  handle(message: BridgeMessage): void {
    const { type, payload } = message;

    if (type === "DECRYPTION_RESULT") {
      let { id, data: url } = payload;
      
      // Auto-resolve logic
      if (id === "stream_auto") {
        const keys = Array.from(this.activeDecryptions.keys());
        id = keys[keys.length - 1] || id;
      }

      const resolve = this.activeDecryptions.get(id);
      if (resolve) {
        this.activeDecryptions.delete(id);
        logger.debug("MessageRouter", `DECRYPTION_RESULT for ${id}: ${url ? "OK" : "null"}`);
        resolve(url || null);
      }
    }

    if (type === "EMBED_VIDEO_URL") {
      this.onStreamFound(payload.url);
    }
  }
}
