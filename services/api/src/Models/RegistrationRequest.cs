using System;
using System.Runtime.Serialization;

namespace TixFactory.PushNotifications.Api;

/// <summary>
/// Request parameters containing the information necessary to send push notifications back to the browser.
/// </summary>
[DataContract]
public class RegistrationRequest
{
    /// <summary>
    /// The endpoint to send push notifications to.
    /// </summary>
    /// <remarks>
    /// This is generated from the browser push API.
    /// https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/endpoint
    /// </remarks>
    [DataMember(Name = "endpoint")]
    public Uri Endpoint { get; set; }

    /// <summary>
    /// When the push subscription will expire.
    /// </summary>
    /// <remarks>
    /// Browsers have the ability to expire the <see cref="Endpoint"/> after a set amount of time.
    /// This property reflects the expiration, if it exists.
    /// See also: https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/expirationTime
    /// </remarks>
    [DataMember(Name = "expiration")]
    public DateTime? Expiration { get; set; }
}
