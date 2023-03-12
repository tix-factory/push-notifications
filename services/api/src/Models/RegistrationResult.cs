using System;
using System.Runtime.Serialization;

namespace TixFactory.PushNotifications.Api;

/// <summary>
/// The current authenticated registration for push notifications.
/// </summary>
[DataContract]
public class RegistrationResult
{
    /// <summary>
    /// The endpoint that will be sent push notifications.
    /// </summary>
    /// <remarks>
    /// This is intended to be kept secret, but it's already available to the browser, so...?
    /// </remarks>
    [DataMember(Name = "endpoint")]
    public Uri Endpoint { get; set; }
}
