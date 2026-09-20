import { Alert, Box, CircularProgress, Link } from '@mui/material';
import {
  BrowserPermission,
  PushSubscriptionState,
  useNotificationPermission,
  usePushNotificationSubscription,
} from '@tix-factory/push-notifications';
import { Fragment, useEffect, useState } from 'react';
import { serviceWorkerUrl } from '../../constants';
import ServerRegistrationState from '../../enums/serverRegistrationState';
import { register, unregister } from '../../services/api';
import SendNotificationButton from './button';
import UnsubscribeButton from './unsubscribe';

type SendNotificationContainerInput = {
  // The (base64 encoded) public key to create the push subscription with.
  pushPublicKey: string;
};

export default function SendNotificationContainer({
  pushPublicKey,
}: SendNotificationContainerInput) {
  const [notificationPermission, requestNotificationPermission] =
    useNotificationPermission();
  const [pushSubscription, pushSubscriptionState, setSubscriptionState] =
    usePushNotificationSubscription({
      serviceWorkerUrl,
      pushSubscriptionOptions: {
        applicationServerKey: pushPublicKey,
        userVisibleOnly: true,
      },
    });
  const [registrationState, setRegistrationState] = useState(
    ServerRegistrationState.Loading,
  );

  useEffect(() => {
    if (
      notificationPermission === BrowserPermission.Denied ||
      pushSubscriptionState === PushSubscriptionState.Unsubscribed
    ) {
      unregister()
        .then(() => {
          console.log(
            notificationPermission === BrowserPermission.Denied
              ? 'Cleared authentication cookie for denied permission.'
              : 'Cleared authentication cookie for unsubscription.',
          );
        })
        .catch((e) => {
          console.error(
            'Failed to clear authentication for denied permission.',
            e,
          );
        });

      return;
    }

    if (!pushSubscription?.endpoint) {
      return;
    }

    console.log('We have a push subscription!', pushSubscription);

    register(pushSubscription)
      .then(() => {
        setRegistrationState(ServerRegistrationState.Success);
      })
      .catch((err) => {
        console.error(
          'Failed to register the push subscription',
          err,
          pushSubscription,
        );
        setRegistrationState(ServerRegistrationState.Error);
      });
  }, [
    pushSubscription,
    pushSubscription?.endpoint,
    notificationPermission,
    pushSubscriptionState,
  ]);

  const grantPermissionClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    await requestNotificationPermission();
  };

  // Check the current state of our notification permissions.
  switch (notificationPermission) {
    case BrowserPermission.Granted:
      // We have notification permission, continue!
      break;

    case BrowserPermission.Denied:
      // We were denied permission.. give the user the bad news they brought upon themselves.
      return (
        <Alert severity="error">
          Notification permission has been explicitly denied.
          <br />
          You cannot receive push notifications.
        </Alert>
      );

    case BrowserPermission.Unsupported:
      // Sad.
      return (
        <Alert severity="error">
          This browser does not support push notifications.
        </Alert>
      );

    case BrowserPermission.RequiresPermission:
      // Request permission from the user.
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
      // Give the user an indicator that we're working on it.
      return <CircularProgress />;

    default:
    case BrowserPermission.Error:
      // Uh oh..
      return (
        <Alert severity="error">
          An unexpected error occurred while checking the browser notification
          permission status.
        </Alert>
      );
  }

  // Check the current state of our push subscription.
  switch (pushSubscriptionState) {
    case PushSubscriptionState.Available:
    case PushSubscriptionState.Unsubscribed:
      // We have our push subscription.
      break;

    case PushSubscriptionState.Loading:
      if (pushSubscription?.endpoint) {
        // We already have a push subscription, which means we got here from a button click.
        // Don't show the loading indicator.
        break;
      }

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

  // Check the current state of our server registration.
  switch (registrationState) {
    case ServerRegistrationState.Success:
      // We successfully registered the subscription, move on.
      break;

    case ServerRegistrationState.Loading:
      // Show a loading indicator while we register the push notification subscription.
      return <CircularProgress />;

    case ServerRegistrationState.Error:
    default:
      return (
        <Alert severity="error">
          The push notification subscription failed to register with the server.
        </Alert>
      );
  }

  // We're all set!
  return (
    <Box
      className="send-notification-button"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <SendNotificationButton pushSubscriptionState={pushSubscriptionState} />
      <br />
      {pushSubscription && (
        <UnsubscribeButton
          pushSubscriptionState={pushSubscriptionState}
          setSubscriptionState={setSubscriptionState}
        />
      )}
    </Box>
  );
}
