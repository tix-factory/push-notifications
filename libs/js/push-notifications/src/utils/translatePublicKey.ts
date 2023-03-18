// This method exists to take a public key string, and translate it to a Uint8Array, to be used with PushSubscriptionOptionsInit.
const translatePublicKey = (publicKey: string) => {
  // Copied from https://github.com/GoogleChromeLabs/web-push-codelab/blob/35098e54b4d2ccc49b25028829acfb789820963e/completed/08-push-subscription-change/scripts/main.js#L32-L45
  const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
  const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export default translatePublicKey;
