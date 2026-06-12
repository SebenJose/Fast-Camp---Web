"use client";

import { useEffect, useState } from "react";

type MockProviderProps = {
  children: React.ReactNode;
};

function shouldEnableMocking() {
  return process.env.NODE_ENV === "development";
}

function isApiRequest(request: Request) {
  return new URL(request.url).pathname.startsWith("/api/");
}

export function MockProvider({ children }: MockProviderProps) {
  const [isReady, setIsReady] = useState(!shouldEnableMocking());

  useEffect(() => {
    if (!shouldEnableMocking()) {
      return;
    }

    void import("./browser")
      .then(({ worker }) =>
        worker.start({
          onUnhandledRequest(request, print) {
            if (isApiRequest(request)) {
              print.error();
            }
          },
        }),
      )
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return null;
  }

  return children;
}
