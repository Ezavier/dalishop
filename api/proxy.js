export const config = {
  runtime: "nodejs",
};

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "缺少 Authorization" }, { status: 401 });
    }

    const DIFY_API_URL = "https://api.dify.ai/v1/chat-messages";
    // 读取前端传过来的请求JSON
    let body = await req.json();

    // 适配：前端带inputs包裹，后端自动剥离，提取到外层，兼容Dify chat‑messages接口
    if (body.inputs) {
      body = { ...body, ...body.inputs };
      delete body.inputs;
    }

    const difyRes = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!difyRes.ok) {
      const text = await difyRes.text();
      return Response.json({ error: "Dify 返回错误", detail: text }, { status: difyRes.status });
    }

    return new Response(difyRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (err) {
    return Response.json({ error: "代理异常", msg: err.message }, { status: 500 });
  }
}
