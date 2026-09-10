# Setup runtime images
FROM node:24 AS base

# Setup build image
FROM node:24 AS build

# Copy files over
COPY ./libs/js ./libs/js
COPY ./services/app ./services/app

# Install the packages
WORKDIR /libs/js/push-notifications
RUN npm ci

WORKDIR /services/app
RUN npm uninstall @tix-factory/push-notifications
RUN npm install @tix-factory/push-notifications@file:../../libs/js/push-notifications
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
COPY --from=build /services/app/dist /app/build

ENTRYPOINT ["npx", "serve", "/app/build"]
