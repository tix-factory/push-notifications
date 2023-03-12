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

    /// <summary>
    /// The public key the push subscription is subscribed with.
    /// </summary>
    /// <remarks>
    /// Base64 encoded.
    ///
    /// a.k.a. p256dh
    /// https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/getKey
    /// </remarks>
    [IgnoreDataMember]
    public string PublicKey { get; set; }

    /// <summary>
    /// The authentication secret for the push subscription.
    /// </summary>
    /// <remarks>
    /// Base64 encoded.
    ///
    /// a.k.a. "auth"
    /// https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/getKey
    /// </remarks>
    [IgnoreDataMember]
    public string AuthenticationSecret { get; set; }
}
