// The different states for a browser permission to be in.
enum BrowserPermission {
  // The permission status is loading, and not yet known.
  Loading = 'Loading',

  // The permission is unsupported by the browser.
  Unsupported = 'Unsupported',

  // The permission has not yet been granted by the human.
  RequiresPermission = 'RequiresPermission',

  // The permission has been granted to the browser.
  Granted = 'Granted',

  // The permission was denied by the human.
  Denied = 'Denied',

  // There was an error checking the permission state.
  Error = 'Error',
}

export default BrowserPermission;
