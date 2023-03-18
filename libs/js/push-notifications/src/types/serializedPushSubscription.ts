// Information about a push subscription, serialized in a format to make it easily sent to a backend server.
type SerializedPushSubscription = {
  // The endpoint to send the push messages to.
  endpoint: string;

  // When the push subscription will expire, if there is a known expiration.
  expiration?: Date;

  // The p256dh key from the push subscription, base64 encoded.
  // See also: https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/getKey
  p256dh: string;

  // The auth key from the push subscription, base64 encoded.
  // See also: https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/getKey
  auth: string;
};

export default SerializedPushSubscription;
