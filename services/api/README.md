# :satellite: Push Notifications (API)

This backend .NET service will listen for requests to both take in the push notification subscription keys + endpoint, and use those parameters to send push notifications outbound to clients.

It is configured to run on a single server, and doesn't support multi-server architecture as-is.

This is a demo project, the authententication mechanism is not setup to share keys across multiple servers. When the server restarts, the authentication, and push notification registration is lost.

## :gear: Configuration

The `VAPID__EMAIL_ADDRESS` environment variable must be set, and is sent to the browser push notification server, as a form of voluntary authentication. It can be used to contact the server owner if needed.

Additionally, we will need a `VAPID__PUBLIC_KEY` and `VAPID__PRIVATE_KEY`. The `PRIVATE_KEY` must pair with the `PUBLIC_KEY`.
If these configurations are not provided, they will be generated when the server starts.

[web-push-codelab](https://web-push-codelab.glitch.me/) is a helpful site that can be used to generate these keys.

See more on `VAPID`: [Sending VAPID identified web push notifications](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)
