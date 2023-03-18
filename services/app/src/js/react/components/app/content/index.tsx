import { Alert, CircularProgress } from '@mui/material';
import {
  ServiceWorkerInstallationState,
  useServiceWorkerRegistration,
} from '@tix-factory/push-notifications';
import { Fragment } from 'react';
import { serviceWorkerUrl } from '../../../../constants';
import SendNotificationButton from '../../send-notification-button';

export default function AppContent() {
  const [, serviceWorkerInstallationState] =
    useServiceWorkerRegistration(serviceWorkerUrl);

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

  // Once we have our registered service worker, show the rest of the content on the page.
  return (
    <Fragment>
      <SendNotificationButton />
    </Fragment>
  );
}
