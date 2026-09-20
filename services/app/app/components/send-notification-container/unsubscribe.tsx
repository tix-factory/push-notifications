import { Button } from '@mui/material';
import { PushSubscriptionState } from '@tix-factory/push-notifications';
import { Fragment } from 'react';

type UnsubscribeButtonInput = {
  // The current push subscription state.
  pushSubscriptionState: PushSubscriptionState;

  setSubscriptionState: (subscribe: boolean) => Promise<void>;
};

export default function UnsubscribeButton({
  pushSubscriptionState,
  setSubscriptionState,
}: UnsubscribeButtonInput) {
  const resubscribe = async () => {
    setSubscriptionState(true).catch((err) => {
      console.error('Failed to resubscribe from push notifications', err);
    });
  };

  const unsubscribe = async () => {
    setSubscriptionState(false).catch((err) => {
      console.error('Failed to unsubscribe from push notifications', err);
    });
  };

  if (pushSubscriptionState === PushSubscriptionState.Unsubscribed) {
    return (
      <Fragment>
        <Button
          onClick={resubscribe}
          variant="outlined"
          color="secondary"
          fullWidth
        >
          Resubscribe to Notifications
        </Button>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Button
        onClick={unsubscribe}
        variant="outlined"
        color="secondary"
        disabled={pushSubscriptionState !== PushSubscriptionState.Available}
        fullWidth
      >
        Unsubscribe from Notifications
      </Button>
    </Fragment>
  );
}
