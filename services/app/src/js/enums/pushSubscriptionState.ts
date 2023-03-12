// Web push subscription states.
enum PushSubscriptionState {
  // The push subscription state is loading.
  Loading = 'Loading',

  // The push subscription is available.
  Available = 'Available',

  // Permission is required before a push subscription can be made available.
  PermissionRequired = 'PermissionRequired',

  // The browser does not support push subscriptions.
  // This could be because notifications are not supported, or service workers are not supported.
  Unsupported = 'Unsupported',

  // An unexpected error occurred loading the push notification subscription.
  Error = 'Error',
}

export default PushSubscriptionState;
