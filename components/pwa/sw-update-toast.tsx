"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function SWUpdateToast() {
  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const { registration } = (event as CustomEvent).detail;

      toast("A new version is available", {
        description: "Update to get the latest features and fixes.",
        action: {
          label: "Update",
          onClick: () => {
            registration.waiting?.postMessage({ type: "SKIP_WAITING" });
          },
        },
        duration: Infinity,
      });
    };

    window.addEventListener("sw-update-available", handleUpdate);

    const handleControllerChange = () => {
      window.location.reload();
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    }

    return () => {
      window.removeEventListener("sw-update-available", handleUpdate);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      }
    };
  }, []);

  return null;
}
