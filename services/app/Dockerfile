# Setup runtime images
FROM node:24 AS base

# Setup build image
FROM node:24 AS build

# Copy files over
COPY ./libs/js ./libs/js
COPY ./services/app ./services/app

# Install the packages
WORKDIR /services/app
RUN npm ci

# Build the app
RUN npm run ci

# Build runtime image
FROM base AS final

# Copy the package.json for the final image.
COPY ./services/app/docker /app
WORKDIR /app

# Install serve, to serve the created frontend files with.
RUN npm ci

# Copy the created files over to the final image.
COPY --from=build /services/app/dist /app/build

ENTRYPOINT ["npx", "serve", "/app/build"]

# Rust application
FROM rust:1.98.1-slim AS server
COPY . /services/app
WORKDIR /services/app
RUN cargo build --release
EXPOSE 8080
CMD ["./target/release/push-notifications-demo"]
