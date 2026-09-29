export const config = {
  runtime: "nodejs",
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(401).json({ error: "缺少 Authorization" });
      return;
    }

    const DIFY_API_URL = "https://api.dify.ai/v1/workflows/run";

    const response = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: req,
    });

    // SSE 流式头
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 管道流转发，不会卡住
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "proxy 代理调用失败",
      detail: err.message,
    });
  }
}
