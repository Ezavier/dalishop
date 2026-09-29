export const config = {
  runtime: "edge"
};

export default async function (req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const body = await req.text();
    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "缺少 Authorization" }, { status: 401 });
    }

    const DIFY_API_URL = "https://api.dify.ai/v1/workflows/run";
    const response = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      },
      body,
      // 加上这个，很多 edge 环境必须
      signal: req.signal
    });

    // 原样把 Dify 的响应返回，支持流式
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });

  } catch (err) {
    console.error("dify proxy error:", err);
    return Response.json(
      { error: "proxy 代理调用失败", detail: err.message },
      { status: 500 }
    );
  }
}
