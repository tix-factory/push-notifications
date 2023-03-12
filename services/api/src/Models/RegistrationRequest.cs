using System;
using System.Runtime.Serialization;

namespace TixFactory.PushNotifications.Api;

/// <summary>
/// Request parameters containing the information necessary to send push notifications back to the browser.
/// </summary>
/// <remarks>
/// It's possible I've done, or named something horribly wrong.
/// I'm writing this demo to further my understanding of the push notification
/// system that browsers have setup. And it's a lot.
///
/// I barely know what I'm talking about, 
/// </remarks>
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

    /// <summary>
    /// The public key the push subscription is subscribed with.
    /// </summary>
    /// <remarks>
    /// Base64 encoded.
    /// </remarks>
    [DataMember(Name = "p256dh")]
    public string PublicKey { get; set; }

    /// <summary>
    /// The authentication secret for the push subscription.
    /// </summary>
    /// <remarks>
    /// Base64 encoded.
    /// </remarks>
    [DataMember(Name = "auth")]
    public string AuthenticationSecret { get; set; }
}
