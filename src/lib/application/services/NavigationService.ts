import { useUIStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";
import { HistoryParams } from "./PlayerUIService";

export class NavigationService {
  private static instance: NavigationService;

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  saveToHistory(params: HistoryParams): void {
    const userStore = useUserStore.getState();
    if (!userStore) return;

    const { addToHistory } = userStore;
    if (params.title && params.image && params.url && params.number) {
      addToHistory({
        ...params,
        timestamp: Date.now(),
      });
    }
  }

  setTabBarVisible(visible: boolean): void {
    const uiStore = useUIStore.getState();
    if (!uiStore) return;

    const setTabBarVisible = uiStore.setTabBarVisible;
    setTabBarVisible(visible);
  }

  resetTabBar(): void {
    this.setTabBarVisible(true);
  }
}
