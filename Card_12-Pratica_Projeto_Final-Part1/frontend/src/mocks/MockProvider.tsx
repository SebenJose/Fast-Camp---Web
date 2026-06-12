"use client";

import { useEffect, useState } from "react";

type MockProviderProps = {
  children: React.ReactNode;
};

function shouldEnableMocking() {
  return process.env.NODE_ENV === "development";
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
          onUnhandledRequest: "bypass",
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
