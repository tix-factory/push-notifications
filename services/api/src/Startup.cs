using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using WebPush;

namespace TixFactory.PushNotifications.Api;

/// <summary>
/// The startup for the HTTP service.
/// </summary>
public class Startup
{
    /// <summary>
    /// Startup method for the application, after <see cref="ConfigureServices"/>.
    /// </summary>
    /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
    public void Configure(IApplicationBuilder app)
    {
        app.UsePathBase("/api");
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseHealthChecks("/health");
        app.UseEndpoints(ConfigureEndpoints);
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    /// <summary>
    /// Where all the services should be registered for the service.
    /// </summary>
    /// <param name="services">The <see cref="IServiceCollection"/>.</param>
    public void ConfigureServices(IServiceCollection services)
    {
        // Add controllers
        services.AddControllers(ConfigureMvc)
            .AddNewtonsoftJson();

        services.AddHealthChecks();

        // Add swagger
        services.AddSwaggerGen(ConfigureSwagger)
            .AddSwaggerGenNewtonsoftSupport();

        // Add "authentication + authorization"
        services.AddAuthentication()
            .AddCookie(ConfigureCookieAuthenticationOptions);

        services.AddAuthorization();

        // Add push notification dependencies
        services.AddSingleton(sp =>
        {
            var vapidConfiguration = sp.GetRequiredService<VapidConfiguration>();
            var webPushClient = new WebPushClient();

            webPushClient.SetVapidDetails(
                subject: $"mailto:{vapidConfiguration.EmailAddress}",
                publicKey: vapidConfiguration.PublicKey,
                privateKey: vapidConfiguration.PrivateKey);

            return webPushClient;
        });

        services.AddSingleton(sp =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();
            var vapidSettings = new VapidConfiguration();
            configuration.Bind("VAPID", vapidSettings);

            if (string.IsNullOrWhiteSpace(vapidSettings.EmailAddress))
            {
                throw new ApplicationException("VAPID EMAIL_ADDRESS is requried to start the application.");
            }

            if (string.IsNullOrWhiteSpace(vapidSettings.PublicKey) && string.IsNullOrWhiteSpace(vapidSettings.PrivateKey))
            {
                var keys = VapidHelper.GenerateVapidKeys();
                vapidSettings.PublicKey = keys.PublicKey;
                vapidSettings.PrivateKey = keys.PrivateKey;
            }
            else
            {
                throw new ApplicationException("PUBLIC_KEY or PRIVATE_KEY is not set");
            }

            return vapidSettings;
        });
    }


    /// <summary>
    /// Configures endpoint routing for the application.
    /// </summary>
    /// <param name="endpointRouteBuilder">The <see cref="IEndpointRouteBuilder"/>.</param>
    protected virtual void ConfigureEndpoints(IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapControllers();
    }

    /// <summary>
    /// Configures <see cref="MvcOptions"/> for the application.
    /// </summary>
    /// <param name="options">The <see cref="MvcOptions"/>.</param>
    protected virtual void ConfigureMvc(MvcOptions options)
    {
        // Require authorization on all endpoints, unless explicitly opted out.
        var authorizationPolicyBuilder = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser();
        authorizationPolicyBuilder.AuthenticationSchemes.Add(CookieAuthenticationDefaults.AuthenticationScheme);
        options.Filters.Add(new AuthorizeFilter(authorizationPolicyBuilder.Build()));

        options.Filters.Add(new ProducesAttribute("application/json"));
    }

    /// <summary>
    /// Configures Swagger.
    /// </summary>
    /// <param name="options">The <see cref="SwaggerGenOptions"/>.</param>
    private void ConfigureSwagger(SwaggerGenOptions options)
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "push-notifications-api",
            Version = "v1"
        });
    }

    /// <summary>
    /// Configures the authentication for the API.
    /// </summary>
    /// <param name="options">The <see cref="CookieAuthenticationOptions"/>.</param>
    private void ConfigureCookieAuthenticationOptions(CookieAuthenticationOptions options)
    {
        options.Events.OnRedirectToLogin = RejectWithUnauthorizedAsync;
        options.Events.OnRedirectToAccessDenied = RejectWithUnauthorizedAsync;
    }

    /// <summary>
    /// Rejects all unauthorized requests with a 401.
    /// </summary>
    /// <remarks>
    /// https://stackoverflow.com/a/65388846/1663648
    /// </remarks>
    /// <param name="redirectContext">The <see cref="RedirectContext{TOptions}"/>.</param>
    private Task RejectWithUnauthorizedAsync(RedirectContext<CookieAuthenticationOptions> redirectContext)
    {
        redirectContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
        return redirectContext.Response.CompleteAsync();
    }
}
