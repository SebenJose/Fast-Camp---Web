"use client";

import { useEffect, useState } from "react";

type MockProviderProps = {
  children: React.ReactNode;
};

function shouldEnableMocking() {
  return process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
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
      .catch((error: unknown) => {
        console.error(
          "Falha ao iniciar o MSW. As requisições vão para a rede real.",
          error,
        );
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return null;
  }

  return children;
}
