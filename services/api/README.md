# :satellite: Push Notifications (API)

This backend .NET service will listen for requests to both register push notification ??? hoopla, and send push notifications outbound to clients.

It is configured to run on a single server, and doesn't support multi-server architecture as-is.

This is a demo project, the authententication mechanism is not setup to share keys across multiple servers. When the server restarts, the authentication, and push notification registration is lost.
