import { Alert, Box, CircularProgress } from '@mui/material';
import { Fragment } from 'react';
import PushSubscriptionState from '../../../enums/pushSubscriptionState';
import usePushNotificationSubscription from '../../hooks/usePushNotificationSubscription';

export default function SendNotificationButton() {
  const [pushSubscription, pushSubscriptionState] =
    usePushNotificationSubscription();

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

  return (
    <Box className="send-notification-button">We have a push subscription!</Box>
  );
}
