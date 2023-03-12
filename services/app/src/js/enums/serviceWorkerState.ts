// States a service worker installation can get into.
enum ServiceWorkerInstallationState {
  // The service worker installation state is loading.
  Loading = 'Loading',

  // The browser does not support service workers.
  Unsupported = 'Unsupported',

  // The service worker is installed.
  Installed = 'Installed',

  // An unexpected error occurred checking the service worker installation.
  Error = 'Error',
}

export default ServiceWorkerInstallationState;
