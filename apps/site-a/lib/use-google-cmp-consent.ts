"use client";

import { useEffect } from "react";

interface GoogleCmpCallbackQueue {
  push(entry: {
    readonly CONSENT_MODE_DATA_READY: () => void;
  }): unknown;
}

interface GoogleCmpApi {
  callbackQueue?: GoogleCmpCallbackQueue;
  getGoogleConsentModeValues?: () => unknown;
}

export interface GoogleCmpWindow {
  googlefc?: GoogleCmpApi;
}

export function registerGoogleCmpConsentCallback(
  target: GoogleCmpWindow,
  callback: (values: unknown) => void,
): void {
  target.googlefc ??= {};
  target.googlefc.callbackQueue ??= [];
  target.googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: () => {
      callback(target.googlefc?.getGoogleConsentModeValues?.());
    },
  });
}

export function useGoogleCmpConsent(
  callback: (values: unknown) => void,
): void {
  useEffect(() => {
    registerGoogleCmpConsentCallback(
      window as unknown as GoogleCmpWindow,
      callback,
    );
  }, [callback]);
}
