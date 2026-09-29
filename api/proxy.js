export const config = {
  runtime: "nodejs"
};

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "缺少 Authorization" }, { status: 401 });
    }

    const DIFY_API_URL = "https://api.dify.ai/v1/workflows/run";

    // 获取原始 body 二进制流
    const bodyBuffer = await req.arrayBuffer();

    const difyRes = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json"
      },
      body: bodyBuffer
    });

    if (!difyRes.ok) {
      const text = await difyRes.text();
      console.error("Dify 后端报错：", text);
      return Response.json({ error: "Dify 返回错误", detail: text }, { status: difyRes.status });
    }

    // 直接把 Dify 的 ReadableStream 返回给前端
    return new Response(difyRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (err) {
    console.error("proxy 异常：", err);
    return Response.json(
      { error: "proxy 代理调用失败", detail: err.message },
      { status: 500 }
    );
  }
}
