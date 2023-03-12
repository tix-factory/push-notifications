# Setup runtime images
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80

# Setup build image
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

# Copy Files
COPY NuGet.config /all/
COPY Directory.Build.props /all/
COPY Directory.Build.targets /all/
COPY Directory.Packages.props /all/
COPY src /all/services/api/src/
WORKDIR /all/services/api/src

# NuGet Restore
RUN dotnet restore

# Build
RUN dotnet build --no-restore -c Release

# Publish
FROM build AS publish
WORKDIR /all/services/api/src
RUN dotnet publish --no-restore --no-build -c Release --output /app

# Build runtime image
FROM base as final
WORKDIR /app
COPY --from=publish /app/ .

# Include curl in final image, for development.
RUN apt-get update
RUN apt-get install curl -y

ENTRYPOINT ["dotnet", "TixFactory.PushNotifications.Api.dll"]

ENV APP_NAME="push-notifications-api"
