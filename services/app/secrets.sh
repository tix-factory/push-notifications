#!/bin/bash

# Generate the keys
openssl genpkey -out auth_private_key.pem -algorithm RSA -pkeyopt rsa_keygen_bits:2048
openssl rsa -in auth_private_key.pem -pubout -out auth_public_key.pem
openssl ecparam -genkey -name prime256v1 | openssl ec -out vapid_keypair.pem
openssl ec -in vapid_keypair.pem -pubout -out public_key.pem
openssl ec -in vapid_keypair.pem -out private_key.pem

# Save the keys on disk, for running locally
# This shouldn't match what's in cloud, you can generate the keys again before running this
echo "VAPID__PUBLIC_KEY=\"$(cat public_key.pem)\"\nVAPID__PRIVATE_KEY=\"$(cat private_key.pem)\"\nJWT__PRIVATE_KEY=\"$(cat auth_private_key.pem)\"" > .dev.vars
