# Setup runtime images
FROM node:19 AS base

# Setup build image
FROM node:19 AS build

# Copy files over
COPY . ./app
WORKDIR /app

# Install the packages
RUN npm ci

# Build the app
RUN npm run build

# Build runtime image
FROM base as final

# Copy the package.json for the final image.
COPY ./docker /app
WORKDIR /app

# Install serve, to serve the created frontend files with.
RUN npm ci

# Copy the created files over to the final image.
COPY --from=build /app/build /app/build

ENTRYPOINT ["npx", "serve", "/app/build"]
