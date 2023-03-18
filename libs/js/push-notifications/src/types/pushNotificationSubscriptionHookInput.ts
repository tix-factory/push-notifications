// Inputs required for the usePushNotificationSubscription hook.
type PushNotificationSubscriptionHookInput = {
  // The URL to the service worker to hook into, for obtaining the push notification subscription.
  serviceWorkerUrl: string;

  // The options to pass to the push subscription when initializing.
  pushSubscriptionOptions: PushSubscriptionOptionsInit;
};

export default PushNotificationSubscriptionHookInput;
