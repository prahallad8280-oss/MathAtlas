const API_ORIGIN = "https://mathatlas.onrender.com";

type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

function buildUpstreamRequest(request: Request) {
  const url = new URL(request.url);
  const upstreamUrl = new URL(url.pathname + url.search, API_ORIGIN);

  return new Request(upstreamUrl.toString(), request);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      try {
        return await fetch(buildUpstreamRequest(request));
      } catch {
        return Response.json(
          {
            message: "The MathAtlas API is temporarily unavailable. Please retry in a few seconds.",
          },
          {
            status: 503,
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
