// React expects this to be used.
// Assigning it to a variable will ignore it.
// See also: https://create-react-app.dev/docs/making-a-progressive-web-app/#customization
// @ts-ignore
// eslint-disable-next-line no-restricted-globals, @typescript-eslint/no-unused-vars
const disable_precache = self.__WB_MANIFEST;

console.log('init service worker', disable_precache);
