"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

import LoadingScreen from "./LoadingScreen";

type GlobalLoadingContextType = {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
};

function NavigationLoadingReset({
  stopLoading,
}: {
  stopLoading: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    stopLoading();
  }, [pathname, search, stopLoading]);

  return null;
}

const GlobalLoadingContext =
  createContext<GlobalLoadingContextType | null>(
    null,
  );

export function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadingTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const showTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | undefined>();

  const startLoading = useCallback(
    (loadingMessage?: string) => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
      if (showTimeout.current) {
        clearTimeout(showTimeout.current);
      }

      setMessage(loadingMessage);
      showTimeout.current = setTimeout(() => {
        setLoading(true);
        showTimeout.current = null;
      }, 120);

      loadingTimeout.current = setTimeout(() => {
        setLoading(false);
        setMessage(undefined);
        loadingTimeout.current = null;
        showTimeout.current = null;
      }, 15000);
    },
    [],
  );

  const stopLoading = useCallback(() => {
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
      loadingTimeout.current = null;
    }
    if (showTimeout.current) {
      clearTimeout(showTimeout.current);
      showTimeout.current = null;
    }

    setLoading(false);
    setMessage(undefined);
  }, []);

  useEffect(() => {
    function handleNavigationClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);

      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search)
      ) {
        return;
      }

      startLoading(destination.pathname);
    }

    document.addEventListener("click", handleNavigationClick, true);
    return () => {
      document.removeEventListener("click", handleNavigationClick, true);
    };
  }, [startLoading]);

  useEffect(() => {
    function handleBackOrForward() {
      startLoading();
    }

    window.addEventListener("popstate", handleBackOrForward);
    return () => {
      window.removeEventListener("popstate", handleBackOrForward);
    };
  }, [startLoading]);

  useEffect(
    () => () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
      if (showTimeout.current) {
        clearTimeout(showTimeout.current);
      }
    },
    [],
  );

  return (
    <GlobalLoadingContext.Provider
      value={{
        startLoading,
        stopLoading,
      }}
    >
      <Suspense fallback={null}>
        <NavigationLoadingReset stopLoading={stopLoading} />
      </Suspense>

      {children}

      {loading && <LoadingScreen message={message} />}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(
    GlobalLoadingContext,
  );

  if (!context) {
    throw new Error(
      "useGlobalLoading must be used inside GlobalLoadingProvider",
    );
  }

  return context;
}