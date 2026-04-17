// Layer/Top/Component/Settings/mobileSettingsStore.ts
type Listener = () => void;

let title = "Settings";
let showBack = false;
let goBackFn: (() => void) | null = null;
let closeFn: (() => void) | null = null;
let isSearchMode = false;
let onExitSearch: (() => void) | null = null;
let searchQuery = "";
const listeners = new Set<Listener>();
const searchListeners = new Set<Listener>();

export const mobileSettingsStore = {
  getState() {
    return { title, showBack, isSearchMode };
  },
  setState(newTitle: string, newShowBack: boolean, newGoBack: () => void, newClose: () => void) {
    title = newTitle;
    showBack = newShowBack;
    goBackFn = newGoBack;
    closeFn = newClose;
    listeners.forEach(listener => listener());
  },
  enterSearchMode(onExit: () => void) {
    isSearchMode = true;
    onExitSearch = onExit;
    listeners.forEach(listener => listener());
  },
  exitSearchMode() {
    isSearchMode = false;
    onExitSearch?.();
    onExitSearch = null;
    searchQuery = "";
    searchListeners.forEach(l => l());
    listeners.forEach(listener => listener());
  },
  setSearchQuery(query: string) {
    searchQuery = query;
    searchListeners.forEach(l => l());
  },
  getSearchQuery() {
    return searchQuery;
  },
  goBack() {
    goBackFn?.();
  },
  close() {
    closeFn?.();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  subscribeSearch(listener: Listener) {
    searchListeners.add(listener);
    return () => searchListeners.delete(listener);
  }
};