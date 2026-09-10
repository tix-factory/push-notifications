// States that sending a push notification can be in.
enum NotificationSendStatus {
  // Nothing is happening right now.
  None = 'None',

  // The push message is being sent.
  Sending = 'Sending',

  // An error occurred while sending the push notification.
  Error = 'Error',

  // The push message was sent successfully.
  Success = 'Success',
}

export default NotificationSendStatus;
