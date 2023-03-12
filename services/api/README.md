# :satellite: Push Notifications (API)

This backend .NET service will listen for requests to both take in the push notification subscription keys + endpoint, and use those parameters to send push notifications outbound to clients.

It is configured to run on a single server, and doesn't support multi-server architecture as-is.

This is a demo project, the authententication mechanism is not setup to share keys across multiple servers. When the server restarts, the authentication, and push notification registration is lost.

## :gear: Configuration

The [appsettings.json](./src/appsettings.json#L12) contains the `PUBLIC_KEY`, which also exists in [pushPublicKey.ts](../app/src/js/constants//pushPublicKey.ts).

When you run this application you must also have a `PRIVATE_KEY` and `EMAIL_ADDRESS` set in the `VAPID` configuration section.

These can be injedcted with the following environment variables:

-   `VAPID__PRIVATE_KEY`
-   `VAPID__EMAIL_ADDRESS`

The `PRIVATE_KEY` must pair with the `PUBLIC_KEY`. For the purposes of this demo, [web-push-codelab](https://web-push-codelab.glitch.me/) can be used to generate these keys.

The `EMAIL_ADDRESS` is sent to the browser push notification server, as a form of voluntary authentication. It can be used to contact the server owner if needed.

See more on `VAPID`: [Sending VAPID identified web push notifications](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)
