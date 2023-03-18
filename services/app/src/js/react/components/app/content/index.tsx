import { Alert, CircularProgress } from '@mui/material';
import {
  ServiceWorkerInstallationState,
  useServiceWorkerRegistration,
} from '@tix-factory/push-notifications';
import { Fragment, useEffect, useState } from 'react';
import { serviceWorkerUrl } from '../../../../constants';
import { loadPublicKey } from '../../../../services/api';
import SendNotificationButton from '../../send-notification-button';

export default function AppContent() {
  const [, serviceWorkerInstallationState] =
    useServiceWorkerRegistration(serviceWorkerUrl);
  const [pushPublicKey, setPushPublicKey] = useState<Uint8Array | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPublicKey()
      .then(setPushPublicKey)
      .catch((err) => {
        console.error('Failed to load public key from server.', err);
        setError(true);
      });
  }, []);

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

  if (error) {
    // We failed to load the public key. :coffin:
    return (
      <Alert severity="error">
        Failed to load push public key from server.
        <br />
        Please refresh the page to try again.
      </Alert>
    );
  }

  if (!pushPublicKey) {
    // Key hasn't loaded yet.
    return <CircularProgress />;
  }

  // Once we have our registered service worker, show the rest of the content on the page.
  return (
    <Fragment>
      <SendNotificationButton pushPublicKey={pushPublicKey} />
    </Fragment>
  );
}
