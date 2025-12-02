/**
 * URL routing utilities for maintaining page state across reloads
 */

import { Prompt } from './types';

export type Page =
 | { type: "home" }
  | { type: "explore"; searchQuery?: string }
  | { type: "repos"; userId?: string }
  | { type: "my-repo"; userId?: string }
  | { type: "my-prompts"; userId?: string }
  | { type: "repo"; repoId: string; from?: "explore" | "repos" | "my-repo" }
  | { type: "create"; editingPrompt?: Prompt; repoId?: string }
  | { type: "prompt"; promptId: string; from?: "home" | "explore" | "repos" | "my-repo" | "my-prompts" | "repo" | "profile" | "create"; repoId?: string }
  | { type: "profile"; userId: string; tab?: string }
  | { type: "settings" }
  | { type: "about" }
  | { type: "terms" }
  | { type: "privacy" }
  | { type: "admin" };

/**
 * Convert a page state to URL path and query parameters
 */
export function pageToUrl(page: Page): { path: string; searchParams: URLSearchParams } {
  const searchParams = new URLSearchParams();

  switch (page.type) {
    case "home":
      return { path: "/", searchParams };

    case "explore":
      if (page.searchQuery) {
        searchParams.set("q", page.searchQuery);
      }
      return { path: "/explore", searchParams };

    case "repos":
      if (page.userId) {
        searchParams.set("userId", page.userId);
      }
      return { path: "/repos", searchParams };

    case "my-repo":
      if (page.userId) {
        searchParams.set("userId", page.userId);
      }
      return { path: "/my-repo", searchParams };

    case "my-prompts":
      if (page.userId) {
        searchParams.set("userId", page.userId);
      }
      return { path: "/my-prompts", searchParams };

    case "repo":
      if (page.from) {
        searchParams.set("from", page.from);
      }
      return { path: `/repo/${page.repoId}`, searchParams };

    case "create":
      if (page.repoId) {
        searchParams.set("repoId", page.repoId);
      }
      // Note: editingPrompt is not serializable to URL
      return { path: "/create", searchParams };

    case "prompt":
      if (page.from) {
        searchParams.set("from", page.from);
      }
      if (page.repoId) {
        searchParams.set("repoId", page.repoId);
      }
      return { path: `/prompt/${page.promptId}`, searchParams };

    case "profile":
      if (page.tab) {
        searchParams.set("tab", page.tab);
      }
      return { path: `/profile/${page.userId}`, searchParams };

    case "settings":
      return { path: "/settings", searchParams };

    case "about":
      return { path: "/about", searchParams };

    case "terms":
      return { path: "/terms", searchParams };

    case "privacy":
      return { path: "/privacy", searchParams };

    case "admin":
      return { path: "/admin-bulk-ops", searchParams };

    default:
      return { path: "/", searchParams };
  }
}

/**
 * Convert URL path and query parameters to page state
 */
export function urlToPage(pathname: string, searchParams: URLSearchParams): Page {
  const path = pathname.replace(/^\/+/, ""); // Remove leading slashes
  const segments = path.split("/").filter(Boolean);

  // Handle root path
  if (segments.length === 0 || path === "") {
    return { type: "home" };
  }

  const [firstSegment, secondSegment] = segments;

  switch (firstSegment) {
    case "explore":
      return {
        type: "explore",
        searchQuery: searchParams.get("q") || undefined
      };

    case "repos":
      return {
        type: "repos",
        userId: searchParams.get("userId") || undefined
      };

    case "my-repo":
      return {
        type: "my-repo",
        userId: searchParams.get("userId") || undefined
      };

    case "my-prompts":
      return {
        type: "my-prompts",
        userId: searchParams.get("userId") || undefined
      };

    case "repo":
      if (secondSegment) {
        return {
          type: "repo",
          repoId: secondSegment,
          from: (searchParams.get("from") as "explore" | "repos" | "my-repo") || undefined
        };
      }
      break;

    case "create":
      return {
        type: "create",
        repoId: searchParams.get("repoId") || undefined
      };

    case "prompt":
      if (secondSegment) {
        return {
          type: "prompt",
          promptId: secondSegment,
          from: (searchParams.get("from") as "home" | "explore" | "repos" | "my-repo" | "my-prompts" | "repo" | "profile" | "create") || undefined,
          repoId: searchParams.get("repoId") || undefined
        };
      }
      break;

    case "profile":
      if (secondSegment) {
        return {
          type: "profile",
          userId: secondSegment,
          tab: searchParams.get("tab") || undefined
        };
      }
      break;

    case "settings":
      return { type: "settings" };

    case "about":
      return { type: "about" };

    case "terms":
      return { type: "terms" };

    case "privacy":
      return { type: "privacy" };

    case "admin-bulk-ops":
      return { type: "admin" };
  }

  // Default to home if no match
  return { type: "home" };
}

/**
 * Update the browser URL to match the current page state
 */
export function updateUrl(page: Page, replace: boolean = false) {
  if (typeof window === "undefined") return;

  const { path, searchParams } = pageToUrl(page);
  const searchString = searchParams.toString();
  const url = searchString ? `${path}?${searchString}` : path;

  if (replace) {
    window.history.replaceState(null, "", url);
  } else {
    window.history.pushState(null, "", url);
  }
}

/**
 * Get the current page state from the browser URL
 */
export function getCurrentPageFromUrl(): Page {
  if (typeof window === "undefined") {
    return { type: "home" };
  }

  const url = new URL(window.location.href);
  return urlToPage(url.pathname, url.searchParams);
}