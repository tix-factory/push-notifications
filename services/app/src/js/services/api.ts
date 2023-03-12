let registeredEndpoints: { [endpoint: string]: Date } = {};

const getPushSubscriptionExpiration = (
  pushSubscription: PushSubscription
): string | null => {
  if (pushSubscription.expirationTime) {
    // https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/expirationTime
    // It is unclear from documentation whether this is an absolute expiration time, or a relative one.
    // This code makes the assumption that it is absolute. 🙈
    return new Date(pushSubscription.expirationTime).toISOString();
  }

  return null;
};

const base64Encode = (arrayBuffer: ArrayBuffer) => {
  // https://stackoverflow.com/a/11562550/1663648
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
};

const register = async (pushSubscription: PushSubscription): Promise<void> => {
  if (!pushSubscription.endpoint) {
    throw new Error('Invalid push subscription endpoint');
  }

  if (registeredEndpoints.hasOwnProperty(pushSubscription.endpoint)) {
    // We've already registered this endpoint, don't do it again - prevent spam to the server.
    return;
  }

  // Fetch the keys for the subscription, so the server can use them when sending push notifications.
  // https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/getKey
  const p256dh = pushSubscription.getKey('p256dh');
  if (!p256dh) {
    throw new Error('Invalid push subscription p256dh key');
  }

  const auth = pushSubscription.getKey('auth');
  if (!auth) {
    throw new Error('Invalid push subscription auth key');
  }

  const response = await fetch('/api/v1/push-notifications/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: pushSubscription.endpoint,
      expiration: getPushSubscriptionExpiration(pushSubscription),
      p256dh: base64Encode(p256dh),
      auth: base64Encode(auth),
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to register push subscription with the server.');
  }

  registeredEndpoints[pushSubscription.endpoint] = new Date();
};

export { register };
