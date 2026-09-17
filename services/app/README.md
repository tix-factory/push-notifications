# :computer: Push Notifications (app)

The [app](./app) directory contains the frontend web app that will be served to browsers, with UX to send a push notification to the browser, and check permissions. These static assets are compiled and served via the Cloudflare worker.

The [src](./src) directory contains the Rust backend API that the web app will be making calls to.

# :bow: Implementation

This app uses [Material UI](https://mui.com/) for a quick, simple design, on top of [React](https://reactjs.org/), via [vite](https://vite.dev/).

# :key: VAPID Keys

Run these commands to generate, and set the VAPID keys for the app.

```sh
# Generate the keys
sh secrets.sh

# Save the keys to the Cloudflare worker
cat auth_private_key.pem | wrangler secret put JWT__PRIVATE_KEY
cat auth_public_key.pem | wrangler secret put JWT__PUBLIC_KEY
cat private_key.pem | wrangler secret put VAPID__PRIVATE_KEY
cat public_key.pem | wrangler secret put VAPID__PUBLIC_KEY
```

Obviously the public keys are not secret, but keeping them with the private keys makes it easier to comprehend what goes with what.
