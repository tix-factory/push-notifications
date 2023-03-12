import { Alert, Box, CircularProgress } from '@mui/material';
import ServiceWorkerInstallationState from '../../../enums/serviceWorkerState';
import useServiceWorkerRegistration from '../../hooks/useServiceWorkerRegistration';
import NotificationPermissionAlert from '../notification-permission-alert';

export default function SendNotificationButton() {
  const [serviceWorkerRegistration, serviceWorkerInstallationState] =
    useServiceWorkerRegistration('./service-worker.js');

  // Show a loading indicator while we install the service worker.
  // The service worker will be activated when a push notification is received.
  switch (serviceWorkerInstallationState) {
    case ServiceWorkerInstallationState.Loading:
      return <CircularProgress />;
    case ServiceWorkerInstallationState.Unsupported:
      return (
        <Alert severity="error">
          The browser does not support service workers, and cannot receive push
          notifications.
        </Alert>
      );
    case ServiceWorkerInstallationState.Error:
      return (
        <Alert severity="error">
          An unexpected errror occurred installing the service worker.
          <br />
          Please refresh the page to try again.
        </Alert>
      );
    default:
      break;
  }

  return (
    <Box className="send-notification-button">
      <NotificationPermissionAlert />
    </Box>
  );
}
