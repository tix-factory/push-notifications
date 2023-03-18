using System.Runtime.Serialization;

namespace TixFactory.PushNotifications.Api;

/// <summary>
/// Metadata about the push notifications for this server.
/// </summary>
[DataContract]
public class MetadataResult
{
    /// <summary>
    /// The base64 encoded public key for the push subscription.
    /// </summary>
    /// <remarks>
    /// This is intended to be the base64 encoded value for the <see href="https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe">PushManager.subscribe</see> applicationServerKey.
    /// </remarks>
    [DataMember(Name = "publicKey")]
    public string PublicKey { get; set; }
}
