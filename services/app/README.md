# :computer: Push Notifications (app)

The [app](./app) directory contains the frontend web app that will be served to browsers, with UX to send a push notification to the browser, and check permissions. These static assets are compiled and served via the Cloudflare worker.

The [src](./src) directory contains the Rust backend API that the web app will be making calls to.

# :bow: Implementation

This app uses [Material UI](https://mui.com/) for a quick, simple design, on top of [React](https://reactjs.org/), via [vite](https://vite.dev/).

# :key: VAPID Keys

Run these commands to generate, and set the VAPID keys for the app.

```sh
# Generate the keys
openssl genpkey -out auth_private_key.pem -algorithm RSA -pkeyopt rsa_keygen_bits:2048
openssl ecparam -genkey -name prime256v1 | openssl ec -out vapid_keypair.pem
openssl ec -in vapid_keypair.pem -pubout -out public_key.pem
openssl ec -in vapid_keypair.pem -out private_key.pem

# Save the keys to the Cloudflare worker
cat auth_private_key.pem | wrangler secret put JWT__PRIVATE_KEY
cat private_key.pem | wrangler secret put VAPID__PRIVATE_KEY
cat public_key.pem | wrangler secret put VAPID__PUBLIC_KEY

# Save the keys on disk, for running locally
# This shouldn't match what's in cloud, you can generate the keys again before running this
echo "VAPID__PUBLIC_KEY=\"$(cat public_key.pem)\"\nVAPID__PRIVATE_KEY=\"$(cat private_key.pem)\"\nJWT__PRIVATE_KEY=\"$(cat auth_private_key.pem)\"" > .dev.vars
```

Obviously the `VAPID__PUBLIC_KEY` is not secret, but keeping it with the private key makes it easier to comprehend what goes with what.
