import { useEffect, useState } from 'react';
import ServiceWorkerInstallationState from '../../enums/serviceWorkerState';

// A hook for installing, and fetching a service worker.
export default function useServiceWorkerRegistration(
  serviceWorkerUrl: string
): [ServiceWorkerRegistration | null, ServiceWorkerInstallationState] {
  const [serviceWorkerInstallationState, setServiceWorkerInstallationState] =
    useState(ServiceWorkerInstallationState.Loading);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setServiceWorkerInstallationState(
        ServiceWorkerInstallationState.Unsupported
      );
      return;
    }

    let disposed = false;

    navigator.serviceWorker
      .register(serviceWorkerUrl)
      .then((registration) => {
        if (disposed) {
          return;
        }

        setServiceWorkerRegistration(registration);
        setServiceWorkerInstallationState(
          ServiceWorkerInstallationState.Installed
        );
      })
      .catch((err) => {
        if (disposed) {
          // We probably shouldn't swallow this error?
          // But it could also be confusing, since it's no longer relevant.
          return;
        }

        console.error('Failed to check service worker registration', err);
        setServiceWorkerInstallationState(ServiceWorkerInstallationState.Error);
      });

    return () => {
      disposed = true;
    };
  }, [serviceWorkerUrl]);

  return [serviceWorkerRegistration, serviceWorkerInstallationState];
}
