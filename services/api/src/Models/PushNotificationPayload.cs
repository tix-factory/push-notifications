using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TixFactory.PushNotifications.Api;

/// <summary>
/// The payload of what is sent to the push notification server.
/// </summary>
[DataContract]
public class PushNotificationPayload
{
    /// <summary>
    /// The notification title.
    /// </summary>
    [DataMember(Name = "title")]
    public string Title { get; set; }

    /// <summary>
    /// The text content of the notification.
    /// </summary>
    [DataMember(Name = "message")]
    public string Message { get; set; }

    /// <summary>
    /// The buttons to display on the notification.
    /// </summary>
    [DataMember(Name = "buttons")]
    public ISet<string> Buttons { get; } = new HashSet<string>();

    /// <summary>
    /// The icon image to use for the notification.
    /// </summary>
    [DataMember(Name = "iconUrl")]
    public Uri Icon { get; set; }

    /// <summary>
    /// The link that the notification will open when clicked.
    /// </summary>
    [DataMember(Name = "link")]
    public Uri Link { get; set; }

    /// <summary>
    /// The link that the first button in the notification will open, when clicked.
    /// </summary>
    [DataMember(Name = "buttonLink")]
    public Uri ButtonLink { get; set; }
}
