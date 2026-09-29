export const config = {
  runtime: "nodejs",
};

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "缺少 Authorization" }, { status: 401 });
    }

    // ✅ 工作流 run 接口，不是 chat-messages
    const DIFY_API_URL = "https://api.dify.ai/v1/workflows/run";

    let body = await req.json();

    // ✅ 这里不删 inputs！保持 inputs 结构原样送给 Dify 工作流
    // 前端传过来是什么，直接转发

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
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

  } catch (err) {
    return Response.json({ error: "代理异常", msg: err.message }, { status: 500 });
  }
}
