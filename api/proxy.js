export const config = {
  runtime: "nodejs",
};

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "缺少 Authorization" }, { status: 401 });
    }

    // ✅ 聊天应用，使用 chat-messages
    const DIFY_API_URL = "https://api.dify.ai/v1/chat-messages";
    let body = await req.json();

    // ✅ 把 inputs 里面的 query 提取到外层，删掉 inputs
    if (body.inputs?.query) {
      body.query = body.inputs.query;
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

    const text = await difyRes.text();
    if (!difyRes.ok) {
      return Response.json({
        error: "Dify 返回错误",
        detail: text
      }, { status: difyRes.status });
    }

    // blocking 模式返回普通 json，不是 sse 流
    return Response.json(JSON.parse(text));

  } catch (err) {
    return Response.json({ error: "代理异常", msg: err.message }, { status: 500 });
  }
}
