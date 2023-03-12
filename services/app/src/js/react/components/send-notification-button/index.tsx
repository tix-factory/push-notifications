import { Box } from '@mui/material';
import NotificationPermissionAlert from '../notification-permission-alert';

export default function SendNotificationButton() {
  return (
    <Box className="send-notification-button">
      <NotificationPermissionAlert />
    </Box>
  );
}
