"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

// How long a restore keeps retrying while the page is still too short to reach
// the saved offset (its content is still streaming in).
const RESTORE_TIMEOUT_MS = 2000;

// Any of these means the user has started scrolling themselves.
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown"] as const;

/**
 * Scrolls to `top`, retrying each frame until the page is tall enough to get
 * there, the user scrolls, or the timeout passes. Returns a function that
 * stops the retries early.
 */
function scrollToWhenReachable(top: number): () => void {
  const deadline = performance.now() + RESTORE_TIMEOUT_MS;
  let frame = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, stop));
  };

  const attempt = () => {
    window.scrollTo({ top, behavior: "instant" });
    // A page shorter than the viewport can still reach 0.
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (maxScroll >= top || performance.now() >= deadline) {
      stop();
    } else {
      frame = requestAnimationFrame(attempt);
    }
  };

  USER_SCROLL_EVENTS.forEach((type) =>
    window.addEventListener(type, stop, { passive: true })
  );
  attempt();
  return stop;
}

/**
 * Restores each page's scroll offset on Back/Forward, and starts pages reached
 * by a link at the top.
 *
 * The browser can't restore in-app navigations itself: the route transition
 * keeps the old page on screen while it exits, so a native restore would scroll
 * (and clamp) the leaving page instead of the one coming back. Reloads and
 * returns from other sites stay with the browser.
 *
 * Returns the callback each page calls as it mounts (see `ScrollOnEnter`).
 */
export function useRouteScrollRestoration() {
  const pathname = usePathname();
  const positions = useRef(new Map<string, number>());
  const previousPathname = useRef(pathname);
  // Where a Back/Forward navigation is heading, until that page mounts.
  const popTarget = useRef<string | null>(null);
  const isInitialPage = useRef(true);
  // Stops a restore that is still retrying.
  const stopPendingRestore = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Wait for load, so a reload's native restore isn't cut off while the
    // page's content is still streaming in.
    const takeOver = () => {
      window.history.scrollRestoration = "manual";
    };
    // On leaving the document (reload, another site), the browser saves the
    // offset and restores it natively when the user comes back.
    const handBack = () => {
      window.history.scrollRestoration = "auto";
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        takeOver();
      }
    };
    const onPopState = () => {
      popTarget.current = window.location.pathname;
    };

    if (document.readyState === "complete") {
      takeOver();
    } else {
      window.addEventListener("load", takeOver, { once: true });
    }
    window.addEventListener("pagehide", handBack);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("load", takeOver);
      window.removeEventListener("pagehide", handBack);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
      handBack();
    };
  }, []);

  // Records where the user left the previous route, once per route change.
  const recordLeavingPage = useCallback((path: string) => {
    if (previousPathname.current !== path) {
      positions.current.set(previousPathname.current, window.scrollY);
      previousPathname.current = path;
    }
  }, []);

  // In the commit that changes the route, the old page is still on screen and
  // still at the user's offset.
  useLayoutEffect(() => {
    recordLeavingPage(pathname);
  }, [pathname, recordLeavingPage]);

  return useCallback(() => {
    // The browser already placed the first page (a fresh load or a reload).
    if (isInitialPage.current) {
      isInitialPage.current = false;
      return;
    }

    // A restore still retrying for the previous page would pull this one
    // toward the old offset.
    stopPendingRestore.current?.();
    stopPendingRestore.current = null;

    // If the page mounts in the same commit as the route change, its effect
    // runs before the one above, so record the old offset before scrolling.
    const path = window.location.pathname;
    recordLeavingPage(path);

    // A pop that never mounted a page (same segment) can leave a stale
    // target; it only counts for the page it was heading to.
    const isPop = popTarget.current === path;
    popTarget.current = null;

    if (isPop) {
      stopPendingRestore.current = scrollToWhenReachable(positions.current.get(path) ?? 0);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [recordLeavingPage]);
}

/** Calls `onEnter` once as its page mounts, before the page first paints. */
export function ScrollOnEnter({ onEnter }: { onEnter: () => void }) {
  const entered = useRef(false);

  useLayoutEffect(() => {
    // Strict Mode runs mount effects twice in development; the second run
    // would otherwise read as a new navigation and scroll to the top.
    if (entered.current) {
      return;
    }
    entered.current = true;
    onEnter();
  }, [onEnter]);

  return null;
}
