import { Alert, Box, CircularProgress } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import PushSubscriptionState from '../../../enums/pushSubscriptionState';
import ServerRegistrationState from '../../../enums/serverRegistrationState';
import { register } from '../../../services/api';
import usePushNotificationSubscription from '../../hooks/usePushNotificationSubscription';

export default function SendNotificationButton() {
  const [pushSubscription, pushSubscriptionState] =
    usePushNotificationSubscription();
  const [registrationState, setRegistrationState] = useState(
    ServerRegistrationState.Loading
  );

  useEffect(() => {
    if (!pushSubscription?.endpoint) {
      return;
    }

    register(pushSubscription)
      .then(() => {
        setRegistrationState(ServerRegistrationState.Success);
      })
      .catch((err) => {
        console.error(
          'Failed to register the push subscription',
          err,
          pushSubscription
        );
        setRegistrationState(ServerRegistrationState.Error);
      });
  }, [pushSubscription?.endpoint]);

  switch (pushSubscriptionState) {
    case PushSubscriptionState.Available:
      // We have our push subscription.
      break;

    case PushSubscriptionState.Loading:
      // Show a loading indicator while we obtain our push notificaiton subscription.
      return <CircularProgress />;

    case PushSubscriptionState.Unsupported:
      // The browser does not support push notification subscriptions.
      return (
        <Alert severity="error">
          The browser does not support push notification subscriptions.
        </Alert>
      );

    case PushSubscriptionState.Error:
      // Something horrible happened here..
      return (
        <Alert severity="error">
          An unexpected errror occurred subscribing to push notifications with
          the browser.
          <br />
          Please refresh the page to try again.
        </Alert>
      );

    case PushSubscriptionState.PermissionRequired:
      // This will be handled by the NotificationPermissionAlert.
      // Show nothing for now.
      return <Fragment />;

    default:
      break;
  }

  switch (registrationState) {
    case ServerRegistrationState.Success:
      // We successfully registered the subscription, move on.
      break;

    case ServerRegistrationState.Loading:
      // Show a loading indicator while we register the push notification subscription.
      return <CircularProgress />;

    case ServerRegistrationState.Error:
    default:
      // We failed to register the push subscription with the server.
      return (
        <Alert severity="error">
          The push notification subscription failed to register with the server.
        </Alert>
      );
  }

  return (
    <Box className="send-notification-button">We have a push subscription!</Box>
  );
}
