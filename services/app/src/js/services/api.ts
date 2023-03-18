import {
  serializePushSubscription,
  translatePublicKey,
} from '@tix-factory/push-notifications';

let registeredEndpoints: { [endpoint: string]: Date } = {};
let publicKey: Uint8Array | null = null;

const register = async (pushSubscription: PushSubscription): Promise<void> => {
  const serializedPushSubscription = await serializePushSubscription(
    pushSubscription
  );
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
};

const sendPushNotification = async (): Promise<void> => {
  const response = await fetch('/api/v1/push-notifications/push', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to send push notification.');
  }
};

const loadPublicKey = async (): Promise<Uint8Array> => {
  if (publicKey) {
    return Promise.resolve(publicKey);
  }

  const response = await fetch('/api/v1/push-notifications/metadata');
  if (!response.ok) {
    throw new Error('Failed to load push notifications public key.');
  }

  const result = await response.json();
  return (publicKey = translatePublicKey(result.publicKey));
};

export { register, loadPublicKey, sendPushNotification };
