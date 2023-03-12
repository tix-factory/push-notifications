using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace TixFactory.PushNotifications.Api;

/// <summary>
/// The entry class for the service.
/// </summary>
public class Program
{
    /// <summary>
    /// The entry method for the service.
    /// </summary>
    /// <param name="args">The command line arguments used to start the service.</param>
    /// <returns>The exit code.</returns>
    public static Task Main(string[] args)
    {
        var webHostBuilder = Host.CreateDefaultBuilder(args).ConfigureWebHostDefaults(webHostBuilder =>
        {
            webHostBuilder.UseStartup<Startup>();
        });

        return webHostBuilder.RunConsoleAsync();
    }
}
