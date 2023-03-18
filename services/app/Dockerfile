# Setup runtime images
FROM node:19 AS base

# Setup image to build the published module with
FROM node:19 AS build-module

# Copy the files over
COPY ./libs/js ./libs/js

# Install the packages
WORKDIR /libs/js/push-notifications
RUN npm ci

# Build the module
RUN npm run build

# Setup build image
FROM node:19 AS build

# Copy files over
COPY --from=build-module /libs/js/push-notifications/dist /libs/js/push-notifications/dist
COPY --from=build-module /libs/js/push-notifications/package.json /libs/js/push-notifications/package.json
COPY ./services/app ./services/app

# Install the packages
WORKDIR /services/app
RUN npm ci

# Build the app
RUN npm run build

# Build runtime image
FROM base as final

# Copy the package.json for the final image.
COPY ./services/app/docker /app
WORKDIR /app

# Install serve, to serve the created frontend files with.
RUN npm ci

# Copy the created files over to the final image.
COPY --from=build /services/app/build /app/build

ENTRYPOINT ["npx", "serve", "/app/build"]
