import SerializedPushSubscription from '../types/serializedPushSubscription';

const getPushSubscriptionExpiration = (
  pushSubscription: PushSubscription
): Date | undefined => {
  if (pushSubscription.expirationTime) {
    // https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/expirationTime
    // It is unclear from documentation whether this is an absolute expiration time, or a relative one.
    // This code makes the assumption that it is absolute. 🙈
    return new Date(pushSubscription.expirationTime);
  }

  return undefined;
};

const base64Encode = (arrayBuffer: ArrayBuffer) => {
  // https://stackoverflow.com/a/11562550/1663648
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
};

// Serializes a push subscription object into something that can be easily read, and sent to a backend server.
export default (
  pushSubscription: PushSubscription
): Promise<SerializedPushSubscription> => {
  if (!pushSubscription.endpoint) {
    return Promise.reject(new Error('Invalid push subscription endpoint'));
  }

  // Fetch the keys for the subscription, so the server can use them when sending push notifications.
  // https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/getKey
  const p256dh = pushSubscription.getKey('p256dh');
  if (!p256dh) {
    return Promise.reject(new Error('Invalid push subscription p256dh key'));
  }

  const auth = pushSubscription.getKey('auth');
  if (!auth) {
    return Promise.reject(new Error('Invalid push subscription auth key'));
  }

  return Promise.resolve({
    endpoint: pushSubscription.endpoint,
    expiration: getPushSubscriptionExpiration(pushSubscription),
    p256dh: base64Encode(p256dh),
    auth: base64Encode(auth),
  });
};
