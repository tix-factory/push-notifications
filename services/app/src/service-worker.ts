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

const openLink = (link: string) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow
  // This is the equivalent to window.open
  self.clients.openWindow(link);
};

self.addEventListener('push', async (event) => {
  try {
    const data = await event.data?.json();
    if (!data) {
      console.warn('Failed to parse push message data into JSON.', event.data);
      return;
    }

    console.log('A push message has been sent to the service worker.', data);

    const actions: NotificationAction[] = [];
    data.buttons.forEach((buttonText: string, i: number) => {
      actions.push({
        action: `button_${i}`,
        title: buttonText,
      });
    });

    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: data.iconUrl,
      data: {
        link: data.link,
        buttonLink: data.buttonLink,
      },
      actions: actions,
    });
  } catch (ex) {
    console.warn(
      'An unexpected error has occurred parsing the push message.',
      ex
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log(
    'A notification has been clicked!',
    event.notification,
    event.action
  );

  if (event.action === 'button_0' && event.notification.data.buttonLink) {
    openLink(event.notification.data.buttonLink);
  } else if (!event.action && event.notification.data.link) {
    openLink(event.notification.data.link);
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('A notification has been closed!', event.notification);
});

// Export something so the script can be combined.
export {};
