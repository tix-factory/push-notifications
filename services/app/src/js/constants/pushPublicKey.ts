// Generated here: https://web-push-codelab.glitch.me/
// See also: https://github.com/GoogleChromeLabs/web-push-codelab/blob/35098e54b4d2ccc49b25028829acfb789820963e/completed/08-push-subscription-change/scripts/main.js#L32-L45
const publicKey =
  'BPMX2ZD3jlIqKZOa8HhAVI2m_Ve_TyQK_opikVeg3v59U0UGTwVrNh9j4pPkMrs5ev5C_GnE6pJwpgASMhGCPWc';

const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
const base64 = (publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');

const rawData = window.atob(base64);
const outputArray = new Uint8Array(rawData.length);

for (let i = 0; i < rawData.length; ++i) {
  outputArray[i] = rawData.charCodeAt(i);
}

export default outputArray;
