using Microsoft.Extensions.Configuration;

namespace TixFactory.PushNotifications.Api;

/// <summary>
/// The VAPID configuration for the application.
/// </summary>
/// <remarks>
/// VAPID details are used to identify ourselves with the push notification server.
/// We must have a public key, private key, and email address.
/// </remarks>
/// <seealso href="https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/"/>
public class VapidConfiguration
{
    /// <summary>
    /// The base64 encoded VAPID public key.
    /// </summary>
    [ConfigurationKeyName("PUBLIC_KEY")]
    public string PublicKey { get; set; }

    /// <summary>
    /// The base64 encoded VAPID private key.
    /// </summary>
    /// <remarks>
    /// Pairs with the public key.
    /// </remarks>
    [ConfigurationKeyName("PRIVATE_KEY")]
    public string PrivateKey { get; set; }

    /// <summary>
    /// The VAPID email address.
    /// </summary>
    [ConfigurationKeyName("EMAIL_ADDRESS")]
    public string EmailAddress { get; set; }
}
