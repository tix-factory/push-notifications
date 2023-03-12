/// <reference lib="webworker" />
// Detect self as a service worker.
declare let self: ServiceWorkerGlobalScope;

// React expects this to be used.
// Assigning it to a variable will ignore it.
// See also: https://create-react-app.dev/docs/making-a-progressive-web-app/#customization
// @ts-ignore
// eslint-disable-next-line no-restricted-globals, @typescript-eslint/no-unused-vars
const disable_precache = self.__WB_MANIFEST;

console.log('Service Worker Initialized');

self.addEventListener('push', (event) => {
  console.log(
    'A push message has been sent to the service worker.',
    event.data
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log(
    'A notification has been clicked!',
    event.notification,
    event.action
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('A notification has been closed!', event.notification);
});

// Export something so the script can be combined.
export {};
