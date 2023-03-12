using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

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
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
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

        // Add swagger
        services.AddSwaggerGen()
            .AddSwaggerGenNewtonsoftSupport();

        // Add "authentication + authorization"
        services.AddAuthentication()
            .AddCookie(ConfigureCookieAuthenticationOptions);

        services.AddAuthorization();
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
