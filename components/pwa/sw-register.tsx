"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent("sw-update-available", { detail: { registration } }));
            }
          });
        });
      } catch (error) {
        console.error("SW registration failed:", error);
      }
    };

    register();
  }, []);

  return null;
}
