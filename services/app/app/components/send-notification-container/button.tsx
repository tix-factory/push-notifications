import { Alert, Button } from '@mui/material';
import { PushSubscriptionState } from '@tix-factory/push-notifications';
import { Fragment, useState } from 'react';
import NotificationSendStatus from '../../enums/notificationSendStatus';
import { sendPushNotification } from '../../services/api';

type SendNotificationButtonInput = {
  // The current push subscription state.
  pushSubscriptionState: PushSubscriptionState;
};

export default function SendNotificationButton({
  pushSubscriptionState,
}: SendNotificationButtonInput) {
  const urlParams = new URLSearchParams(location.search);
  const [sendStatus, setSendStatus] = useState(
    urlParams.has('notification_clicked')
      ? NotificationSendStatus.Clicked
      : NotificationSendStatus.None,
  );

  const sendPushNotificationClicked = async () => {
    setSendStatus(NotificationSendStatus.Sending);

    try {
      await sendPushNotification();
      setSendStatus(NotificationSendStatus.Success);
    } catch (err) {
      console.error('Failed to send push notification', err);
      setSendStatus(NotificationSendStatus.Error);
    }
  };

  return (
    <Fragment>
      {sendStatus === NotificationSendStatus.Clicked && (
        <Fragment>
          <Alert severity="info">
            Hello, world! Did you notice the "action" button?
          </Alert>
          <br />
        </Fragment>
      )}
      {sendStatus === NotificationSendStatus.Success && (
        <Fragment>
          <Alert severity="success">Push notification has been sent.</Alert>
          <br />
        </Fragment>
      )}
      {sendStatus === NotificationSendStatus.Error && (
        <Fragment>
          <Alert severity="error">Push notification failed to send.</Alert>
          <br />
        </Fragment>
      )}
      <Button
        onClick={sendPushNotificationClicked}
        variant="outlined"
        color="primary"
        disabled={
          sendStatus === NotificationSendStatus.Sending ||
          pushSubscriptionState !== PushSubscriptionState.Available
        }
        fullWidth
      >
        Send Push Notification
      </Button>
    </Fragment>
  );
}
