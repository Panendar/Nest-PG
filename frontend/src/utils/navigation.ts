const LAST_SEARCH_CONTEXT_KEY = "my_pg_last_search";

export function getModuleBasePath(pathname: string): string {
  const [, firstSegment] = pathname.split("/");
  return firstSegment ? `/${firstSegment}` : "/app";
}

export function readLastSearchContext(fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const storedValue = window.sessionStorage.getItem(LAST_SEARCH_CONTEXT_KEY);
  if (!storedValue || !storedValue.startsWith("/")) {
    return fallback;
  }

  return storedValue;
}

export function rememberSearchContext(path: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(LAST_SEARCH_CONTEXT_KEY, path);
}
