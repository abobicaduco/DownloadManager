export {};

declare global {
  interface Window {
    pywebview?: {
      api?: {
        get_queue?: () => Promise<unknown>;
        download_link?: (url: string, folder: string) => Promise<unknown>;
        clear_history?: () => Promise<unknown>;
        minimize_app?: () => void;
        close_app?: () => void;
      };
    };
  }
}
