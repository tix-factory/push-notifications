import BrowserPermission from '../../enums/browserPermission';
import { useEffect, useState } from 'react';

// This hook can be used to fetch the current state of whether or not notification
// permission has been granted by the human to the browser.
export default function useNotificationPermission(): [
  BrowserPermission,
  () => Promise<void>
] {
  const [browserPermission, setBrowserPermission] = useState(
    BrowserPermission.Loading
  );

  // Setup the hook, and listen for changes.
  useEffect(() => {
    if (!window.Notification || !('permissions' in navigator)) {
      setBrowserPermission(BrowserPermission.Unsupported);
      return;
    }

    let unregistered = false;
    let permissionStatus: PermissionStatus | null;

    const eventHandler = () => {
      if (!permissionStatus) {
        // The useEffect has been "disposed", do nothing.
        return;
      }

      switch (permissionStatus.state) {
        case 'prompt':
          setBrowserPermission(BrowserPermission.RequiresPermission);
          return;
        case 'granted':
          setBrowserPermission(BrowserPermission.Granted);
          return;
        case 'denied':
          setBrowserPermission(BrowserPermission.Denied);
          return;
        default:
          console.error(
            'Unrecognized permission state:',
            permissionStatus.state
          );
          setBrowserPermission(BrowserPermission.Error);
          return;
      }
    };

    navigator.permissions
      .query({ name: 'notifications' })
      .then((permission: PermissionStatus) => {
        if (unregistered) {
          return;
        }

        permissionStatus = permission;
        permission.addEventListener('change', eventHandler);
        eventHandler();
      })
      .catch((err) => {
        if (unregistered) {
          return;
        }

        console.error('Failed to query notifications permission', err);
        setBrowserPermission(BrowserPermission.Error);
      });

    return () => {
      unregistered = true;
      permissionStatus?.removeEventListener('change', eventHandler);
      permissionStatus = null;
    };
  }, []);

  // Allow consumers of the hook to request the permission to be set.
  const requestPermission = async (): Promise<void> => {
    await Notification.requestPermission();
  };

  return [browserPermission, requestPermission];
}
