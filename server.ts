import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dns from "dns";

// Set default DNS resolution to ipv4 first to avoid slow fetches
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

// Increase payload bounds for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize official Gemini Client (as high-performance fallback/image analyzer)
let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': "aistudio-build",
        }
      }
    });
    console.log("Stone AI: Official Gemini fallback module loaded.");
  } catch (error) {
    console.error("Stone AI: Failed to initialize Gemini helper:", error);
  }
}

/**
 * STEP 1 - AMBIL COOKIE (SESSION)
 */
async function getCookiesAndCsrf() {
  const res = await fetch("https://chatgpt.org/", {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });
 
  const html = await res.text();
  const setCookie = res.headers.get("set-cookie");
 
  const cookies = setCookie
    ? setCookie.split(",").map(c => c.split(";")[0]).join("; ")
    : "";
 
  const csrf =
    html.match(/csrf-token["'] content=["'](.*?)["']/i)?.[1] ||
    html.match(/XSRF-TOKEN=(.*?);/i)?.[1];
 
  return { cookies, csrf };
}

// REST API for Chat Scraper & Fallback
app.post("/api/chat", async (req, res) => {
  const { prompt, model = "anthropic/claude-haiku-4-5", fileBase64, fileMime } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  // Set up headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log(`Stone AI Request: model=${model}, prompt length=${prompt.length}`);

  try {
    // If the request has an attached file/image, or the scraper is skipped/fails, 
    // we use Gemini directly to provide elite multimodal analysis.
    let useGeminiDirectly = !!fileBase64;
    
    if (useGeminiDirectly && ai) {
      console.log("Stone AI: Processing multimodal or image-bound query via Gemini fallback.");
      const imagePart = {
        inlineData: {
          mimeType: fileMime || "image/png",
          data: fileBase64,
        },
      };
      
      const contentsParts: any[] = [imagePart, { text: prompt }];
      
      const stream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: { parts: contentsParts },
        config: {
          systemInstruction: "You are Stone AI, a premium, sturdy, and elegant conversational intelligence. Address queries confidently.",
        }
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    // Try Scrape Server First
    try {
      console.log("Stone AI Scraper: Obtaining CSRF values...");
      const { cookies } = await getCookiesAndCsrf();

      console.log("Stone AI Scraper: Forwarding stream to ChatGPT API...");
      const fetchPromise = fetch("https://chatgpt.org/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          "Origin": "https://chatgpt.org",
          "Referer": "https://chatgpt.org/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "Cookie": cookies,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      // Simple response timeout of 4 seconds to trigger fallback early if scraper is dead or rate-limited
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Scrape Timeout")), 5000)
      );

      const scraperRes: any = await Promise.race([fetchPromise, timeoutPromise]);

      if (!scraperRes.ok) {
        throw new Error(`Scraper request status: ${scraperRes.status}`);
      }

      console.log("Stone AI Scraper: Scraping connection succeeded; streaming to client...");
      
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      for await (const chunk of scraperRes.body) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.replace("data:", "").trim();
          if (!jsonStr || jsonStr.startsWith(":")) continue;

          try {
            const json = JSON.parse(jsonStr);
            const text = json?.choices?.[0]?.delta?.content;

            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          } catch (e) {
            // Suppress parse mistakes
          }
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();

    } catch (scrapeError: any) {
      console.warn("Stone AI Scraper: Failed/timed out. Activating Gemini official fallback:", scrapeError.message);
      
      if (!ai) {
        throw new Error("Gemini fallback not initialized - check GEMINI_API_KEY");
      }

      // Seamlessly stream from official high-speed Gemini fallback
      const stream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Stone AI, a premium, sturdy, and elegant conversational intelligence. Address queries confidently with clear Markdown formatting. (Note: Running on Stone Core backup layer)",
        }
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    }

  } catch (error: any) {
    console.error("Stone AI Core Error:", error);
    res.write(`data: ${JSON.stringify({ error: "Stone AI Core encountering issues: " + error.message })}\n\n`);
    res.end();
  }
});

// Setup development or static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Stone AI Application server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
