using System;
using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using WebPush;

namespace TixFactory.PushNotifications.Api.Controllers;

/// <summary>
/// A controller for sending push notifications.
/// </summary>
[Route("v1/push-notifications")]
public class PushNotificationsController : Controller
{
    private readonly IAuthenticationService _AuthenticationService;
    private readonly IConfiguration _Configuration;
    private readonly WebPushClient _WebPushClient;
    private readonly ILogger<PushNotificationsController> _Logger;

    /// <summary>
    /// Initializes a new <see cref="PushNotificationsController"/>.
    /// </summary>
    /// <param name="authenticationService">An <see cref="IAuthenticationService"/>.</param>
    /// <param name="configuration">The <see cref="IConfiguration"/>.</param>
    /// <param name="webPushClient">A <see cref="WebPushClient"/>.</param>
    /// <param name="logger">An <see cref="ILogger{TCategoryName}"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="authenticationService"/>
    /// - <paramref name="configuration"/>
    /// - <paramref name="logger"/>
    /// </exception>
    public PushNotificationsController(
        IAuthenticationService authenticationService,
        IConfiguration configuration,
        WebPushClient webPushClient,
        ILogger<PushNotificationsController> logger)
    {
        _AuthenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
        _Configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _WebPushClient = webPushClient;
        _Logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Gets the current push notification registration status.
    /// </summary>
    /// <response code="401">The browser has not yet registered themselves, and so they are unauthenticated, and there is no registration to fetch.</response>
    [HttpGet, Route("registration")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(RegistrationResult), (int)HttpStatusCode.OK)]
    public async Task<ActionResult> GetRegistration()
    {
        var result = await GetPushSubscription();
        if (result == null)
        {
            // This should be impossible, if we're here, we're authorized.
            return Unauthorized();
        }

        return Json(result);
    }

    /// <summary>
    /// Registers the information required to send push notifications to the user.
    /// </summary>
    /// <remarks>
    /// This endpoint essentially acts as a "signup/login" endpoint, and registers the push notification
    /// registration information into the cookie.
    ///
    /// We store it in the cookie so we do not have to maintain a database for this information, for this demo.
    /// You may want to take this registration information and store it somewhere, to be used later.
    /// </remarks>
    /// <param name="request">The request body containing the registration information.</param>
    [HttpPost, Route("register")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> Register([FromBody] RegistrationRequest request)
    {
        // We don't really have an identity, since we're not a real authenticated service.
        // So I guess we'll just leave this blank.
        var claimsIdentifier = new ClaimsIdentity(Array.Empty<Claim>(), CookieAuthenticationDefaults.AuthenticationScheme);

        // But what we do have.. is the push notification registration information that we'll want to use later.
        var authenticationProperties = new AuthenticationProperties(new Dictionary<string, string>
        {
            [nameof(request.Endpoint)] = request.Endpoint.AbsoluteUri,
            [nameof(request.PublicKey)] = request.PublicKey,
            [nameof(request.AuthenticationSecret)] = request.AuthenticationSecret,
        });

        // Now "sign the user in" to store the registration information in the cookie.
        await _AuthenticationService.SignInAsync(
            HttpContext,
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentifier),
            authenticationProperties);

        return NoContent();
    }

    /// <summary>
    /// Forgets the registration information.
    /// </summary>
    /// <remarks>
    /// This endpoint essentially acts as a "logout" and "forget my account" endpoint.
    /// By clearing the cookie, the only thing we know about the browser is gone.
    /// </remarks>
    [HttpDelete, Route("unregister")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> Logout()
    {
        await _AuthenticationService.SignOutAsync(HttpContext, CookieAuthenticationDefaults.AuthenticationScheme, properties: null);
        return NoContent();
    }

    /// <summary>
    /// Sends a push notification to the endpoint that was previously registered.
    /// </summary>
    /// <param name="cancellationToken">The <see cref="CancellationToken"/>.</param>
    /// <response code="401">The browser has not yet registered themselves, and so they are unauthenticated, and cannot be sent a push notification.</response>
    [HttpPost, Route("push")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> SendPushNotification(CancellationToken cancellationToken)
    {
        var subscription = await GetPushSubscription();
        if (subscription == null)
        {
            // This should be impossible, if we're here, we're authorized.
            return Unauthorized();
        }

        if (_WebPushClient == null)
        {
            _Logger.LogError($"{nameof(WebPushClient)} is unavailable. Please make sure you have a PRIVATE_KEY, PUBLIC_KEY, and EMAIL_ADDRESS set.");
            return new StatusCodeResult((int)HttpStatusCode.InternalServerError);
        }

        var options = new Dictionary<string, object>();
        var pushNotificationConfiguration = _Configuration.GetSection("PushNotifications");
        var timeToLive = pushNotificationConfiguration.GetValue<TimeSpan?>("TimeToLive");
        if (timeToLive.HasValue)
        {
            // How long a push message is retained by the push service (by default, four weeks).
            options["TTL"] = (int)Math.Ceiling(timeToLive.Value.TotalSeconds);
        }

        var pushNotification = new PushNotificationPayload
        {
            Title = "Hello, world!",
            Message = "This notification was sent using the push API.",
            Link = new Uri("https://demo.push-notifications.app?notification_clicked=true"),
            ButtonLink = new Uri("https://github.com/tix-factory/push-notifications/issues"),
            Icon = new Uri("https://cdn.jsdelivr.net/gh/twitter/twemoji@v14.0.2/assets/72x72/1f514.png")
        };

        pushNotification.Buttons.Add("🐛 File Bug");

        var pushSubscription = new PushSubscription(
            endpoint: subscription.Endpoint.AbsoluteUri,
            p256dh: subscription.PublicKey,
            auth: subscription.AuthenticationSecret);

        await _WebPushClient.SendNotificationAsync(
            pushSubscription,
            payload: JsonConvert.SerializeObject(pushNotification),
            options,
            cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Gets the currently authenticated push subscription.
    /// </summary>
    /// <returns>The push subscription information.</returns>
    private async Task<RegistrationResult> GetPushSubscription()
    {
        var authenticationSession = await _AuthenticationService.AuthenticateAsync(HttpContext, CookieAuthenticationDefaults.AuthenticationScheme);
        if (authenticationSession.Properties?.Items.TryGetValue(nameof(RegistrationRequest.Endpoint), out var rawEndpoint) != true
            || !Uri.TryCreate(rawEndpoint, UriKind.Absolute, out var endpoint)
            || !authenticationSession.Properties.Items.TryGetValue(nameof(RegistrationRequest.PublicKey), out var publicKey)
            || !authenticationSession.Properties.Items.TryGetValue(nameof(RegistrationRequest.AuthenticationSecret), out var authenticationSecret))
        {
            return null;
        }

        return new RegistrationResult
        {
            Endpoint = endpoint,
            PublicKey = publicKey,
            AuthenticationSecret = authenticationSecret
        };
    }
}
