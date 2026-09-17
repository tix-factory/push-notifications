import { serializePushSubscription } from '@tix-factory/push-notifications';

const registeredEndpoints: { [endpoint: string]: Date } = {};
let publicKey: string | null = null;

export async function register(
  pushSubscription: PushSubscription,
): Promise<void> {
  const serializedPushSubscription =
    await serializePushSubscription(pushSubscription);

  // eslint-disable-next-line no-prototype-builtins
  if (registeredEndpoints.hasOwnProperty(serializedPushSubscription.endpoint)) {
    // We've already registered this endpoint, don't do it again - prevent spam to the server.
    return;
  }

  const response = await fetch('/api/v1/push-notifications/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: serializedPushSubscription.endpoint,
      expiration: serializedPushSubscription.expiration?.toISOString(),
      p256dh: serializedPushSubscription.p256dh,
      auth: serializedPushSubscription.auth,
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to register push subscription with the server.');
  }

  registeredEndpoints[pushSubscription.endpoint] = new Date();
}

export async function unregister(): Promise<void> {
  const response = await fetch('/api/v1/push-notifications/unregister', {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to unregister push subscription with the server.');
  }

  // Clear the "cache"
  Object.keys(registeredEndpoints).forEach((key) => {
    delete registeredEndpoints[key];
  });
}

export async function sendPushNotification(): Promise<void> {
  const response = await fetch('/api/v1/push-notifications/push', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to send push notification.');
  }
}

export async function loadPublicKey(): Promise<string> {
  if (publicKey) {
    return Promise.resolve(publicKey);
  }

  const response = await fetch('/api/v1/push-notifications/metadata');
  if (!response.ok) {
    throw new Error('Failed to load push notifications public key.');
  }

  const result = await response.json();
  return (publicKey = result.publicKey);
}
