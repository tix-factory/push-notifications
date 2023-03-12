using System;
using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TixFactory.PushNotifications.Api.Controllers;

/// <summary>
/// A controller for sending push notifications.
/// </summary>
[Route("v1/push-notifications")]
public class PushNotificationsController : Controller
{
    private readonly IAuthenticationService _AuthenticationService;

    /// <summary>
    /// Initializes a new <see cref="PushNotificationsController"/>.
    /// </summary>
    /// <param name="authenticationService">An <see cref="IAuthenticationService"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="authenticationService"/>
    /// </exception>
    public PushNotificationsController(IAuthenticationService authenticationService)
    {
        _AuthenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
    }

    /// <summary>
    /// Gets the current push notification registration status.
    /// </summary>
    /// <response code="401">The browser has not yet registered themselves, and so they are unauthenticated, and there is no registration to fetch.</response>
    [HttpGet, Route("registration")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(RegistrationResult), (int)HttpStatusCode.OK)]
    public RegistrationResult GetRegistration()
    {
        var result = new RegistrationResult();
        return result;
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
    /// <response code="401">The browser has not yet registered themselves, and so they are unauthenticated, and cannot be sent a push notification.</response>
    [HttpPost, Route("push")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> SendPushNotification()
    {
        return NoContent();
    }
}
