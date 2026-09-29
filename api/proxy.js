export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  // 只处理 POST 请求
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 从 Vercel 环境变量读取密钥，密钥不在代码里面
    const DIFY_API_KEY = process.env.DIFY_API_KEY;
    if (!DIFY_API_KEY) {
      return Response.json({ error: "缺少 DIFY_API_KEY 环境变量" }, { status: 500 });
    }

    // 拿到前端传过来的 body
    const body = await req.json();

    // Dify 工作流 run 接口
    const difyRes = await fetch("https://api.dify.ai/v1/workflows/run", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // 原样透传 Dify 返回给前端
    const difyData = await difyRes.json();
    return Response.json(difyData, { status: difyRes.status });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
