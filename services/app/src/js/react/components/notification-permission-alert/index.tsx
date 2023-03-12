import { Alert, Link } from '@mui/material';
import { Fragment } from 'react';
import BrowserPermission from '../../../enums/browserPermission';
import useNotificationPermission from '../../hooks/useNotificationPermission';

export default function NotificationPermissionAlert() {
  const [notificationPermission, requestNotificationPermission] =
    useNotificationPermission();

  const grantPermissionClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    await requestNotificationPermission();
  };

  switch (notificationPermission) {
    case BrowserPermission.Granted:
      return <Fragment />;
    case BrowserPermission.Denied:
      return (
        <Alert severity="error">
          Notification permission has been explicitly denied.
          <br />
          You cannot receive push notifications.
        </Alert>
      );
    case BrowserPermission.Unsupported:
      return (
        <Alert severity="error">
          This browser does not support push notifications.
        </Alert>
      );
    case BrowserPermission.RequiresPermission:
      return (
        <Alert severity="warning">
          You must{' '}
          <Link onClick={grantPermissionClick} href="#">
            grant permission
          </Link>{' '}
          to receive push notifications.
        </Alert>
      );
    case BrowserPermission.Loading:
      return (
        <Alert severity="info">
          Checking the notification permission browser setting...
        </Alert>
      );
    default:
    case BrowserPermission.Error:
      return (
        <Alert severity="error">
          An unexpected error occurred while checking the browser notification
          permission status.
        </Alert>
      );
  }
}
