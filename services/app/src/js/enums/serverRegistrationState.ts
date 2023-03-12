// States for registering the push subscription with the server.
enum ServerRegistrationState {
  // The subscription is currently being registered.
  Loading = 'Loading',

  // The subscription failed to register.
  Error = 'Error',

  // The subscription registered successfully.
  Success = 'Success',
}

export default ServerRegistrationState;
