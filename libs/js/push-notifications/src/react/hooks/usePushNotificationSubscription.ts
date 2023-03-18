import { useEffect, useState } from 'react';
import PushSubscriptionState from '../../enums/pushSubscriptionState';
import ServiceWorkerInstallationState from '../../enums/serviceWorkerInstallationState';
import BrowserPermission from '../../enums/browserPermission';
import useNotificationPermission from './useNotificationPermission';
import useServiceWorkerRegistration from './useServiceWorkerRegistration';
import PushNotificationSubscriptionHookInput from '../../types/pushNotificationSubscriptionHookInput';

// A hook for obtaining a push subscription, intended for notifications.
// TODO: This hook doesn't support push subscription changes.
// See: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/pushsubscriptionchange_event
export default function usePushNotificationSubscription({
  serviceWorkerUrl,
  pushSubscriptionOptions,
}: PushNotificationSubscriptionHookInput): [
  PushSubscription | null,
  PushSubscriptionState
] {
  const [notificationPermission] = useNotificationPermission();
  const [serviceWorkerRegistration, serviceWorkerInstallationState] =
    useServiceWorkerRegistration(serviceWorkerUrl);
  const [pushSubscriptionState, setPushSubscriptionState] = useState(
    PushSubscriptionState.Loading
  );
  const [pushSubscription, setPushSubscription] =
    useState<PushSubscription | null>(null);

  useEffect(() => {
    // Service workers are required to obtain a push subscription.
    switch (serviceWorkerInstallationState) {
      case ServiceWorkerInstallationState.Installed:
        // Service worker is ready, go to the next check.

        break;
      case ServiceWorkerInstallationState.Loading:
        // Still installing the service worker, keep waiting.
        setPushSubscriptionState(PushSubscriptionState.Loading);

        return;
      case ServiceWorkerInstallationState.Unsupported:
        // Service workers are not supported, not way to get a push subscription.
        setPushSubscriptionState(PushSubscriptionState.Unsupported);

        return;
      case ServiceWorkerInstallationState.Error:
      default:
        // We don't know what happened... ⚰️
        setPushSubscriptionState(PushSubscriptionState.Error);
        return;
    }

    if (serviceWorkerRegistration === null) {
      // Not sure how we ended up here, since the state is that it is installed..
      // guess we keep waiting?
      setPushSubscriptionState(PushSubscriptionState.Loading);
      return;
    }

    if (!serviceWorkerRegistration.pushManager) {
      // I guess we don't have push support...
      setPushSubscriptionState(PushSubscriptionState.Unsupported);
      return;
    }

    // Check notification permissions, tied to push subscriptions.
    switch (notificationPermission) {
      case BrowserPermission.Granted:
        // We have permission, continue to the next step.

        break;
      case BrowserPermission.Loading:
        // Still waiting to figure out the browser permission.
        setPushSubscriptionState(PushSubscriptionState.Loading);

        return;
      case BrowserPermission.RequiresPermission:
      case BrowserPermission.Denied:
        // We cannot load a push subscription because we do not have permission to.
        setPushSubscriptionState(PushSubscriptionState.PermissionRequired);

        return;
      case BrowserPermission.Unsupported:
        // Notifications are not supported, not way to get a push notification.
        setPushSubscriptionState(PushSubscriptionState.Unsupported);

        return;
      case BrowserPermission.Error:
      default:
        // Failed to check browser permissions... ⚰️
        setPushSubscriptionState(PushSubscriptionState.Error);
        return;
    }

    let disposed = false;

    serviceWorkerRegistration.pushManager
      .getSubscription()
      .then((subscription) => {
        if (disposed) {
          return;
        }

        if (subscription) {
          setPushSubscription(subscription);
          setPushSubscriptionState(PushSubscriptionState.Available);
        } else {
          serviceWorkerRegistration.pushManager
            .subscribe(pushSubscriptionOptions)
            .then((newSubscription) => {
              if (disposed) {
                return;
              }

              setPushSubscription(newSubscription);
              setPushSubscriptionState(PushSubscriptionState.Available);
            })
            .catch((err) => {
              if (disposed) {
                // Poor swallowed error.
                return;
              }

              console.error('Failed to subscribe to push notifications', err);
              setPushSubscriptionState(PushSubscriptionState.Error);
            });
        }
      })
      .catch((err) => {
        if (disposed) {
          // Poor swallowed error.
          return;
        }

        console.error('Failed to check push subscription.', err);
        setPushSubscriptionState(PushSubscriptionState.Error);
      });

    return () => {
      disposed = true;
    };
  }, [
    notificationPermission,
    serviceWorkerRegistration,
    serviceWorkerInstallationState,
  ]);

  return [pushSubscription, pushSubscriptionState];
}
