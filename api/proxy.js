export const config = {
  runtime: "edge"
};

export default async function (req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const body = await req.text();
    const DIFY_API_URL = "https://api.dify.ai/v1/workflows/run";
    const response = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": req.headers.get("authorization"),
        "Content-Type": "application/json"
      },
      body
    });
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "proxy 代理调用失败" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}