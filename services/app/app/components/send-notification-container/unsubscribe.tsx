import { Button } from '@mui/material';
import { Fragment, useState } from 'react';

type UnsubscribeButtonInput = {
  // The (base64 encoded) public key to create the push subscription with.
  pushSubscription: PushSubscription;
};

export default function UnsubscribeButton({
  pushSubscription,
}: UnsubscribeButtonInput) {
  const [disabled, setDisabled] = useState(false);

  const buttonClicked = async () => {
    setDisabled(true);
    pushSubscription
      .unsubscribe()
      .then(() => {
        console.log('Done?');
      })
      .catch((e) => {
        console.error('Failed to unsubscribe:', e);
      });
  };

  return (
    <Fragment>
      <Button
        onClick={buttonClicked}
        variant="outlined"
        color="secondary"
        disabled={disabled}
        fullWidth
      >
        Unsubscribe from Notifications
      </Button>
    </Fragment>
  );
}
