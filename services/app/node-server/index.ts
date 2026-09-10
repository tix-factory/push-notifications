/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

export default {
  /**
   * This is the standard fetch handler for a Cloudflare Worker
   *
   * @param request - The request submitted to the Worker from the client
   * @param env - The interface to reference bindings declared in wrangler.jsonc
   * @param _ctx - The execution context of the Worker
   * @returns The response to be sent back to the client
   */
  async fetch(request, env, _ctx): Promise<Response> {
    const url = new URL(request.url);

    // 1. Backend Routing
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({
          error: 'unimplemented',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 501,
        },
      );
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
