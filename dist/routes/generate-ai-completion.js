var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/generate-ai-completion.ts
var generate_ai_completion_exports = {};
__export(generate_ai_completion_exports, {
  generateAICompletionRoute: () => generateAICompletionRoute
});
module.exports = __toCommonJS(generate_ai_completion_exports);
var import_ai = require("ai");
var import_zod = require("zod");

// src/lib/openai.ts
var import_config = require("dotenv/config");
var import_openai = require("openai");
var openai = new import_openai.OpenAI({
  apiKey: process.env.OPENAI_KEY
});

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/routes/generate-ai-completion.ts
async function generateAICompletionRoute(app) {
  app.post("/ai/generate", async (req, res) => {
    const bodySchema = import_zod.z.object({
      videoId: import_zod.z.string().uuid(),
      prompt: import_zod.z.string(),
      temperature: import_zod.z.number().min(0).max(1).default(0.5)
    });
    const {
      prompt,
      temperature,
      videoId
    } = bodySchema.parse(req.body);
    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId
      }
    });
    if (!video.transcription)
      return res.status(400).send({ error: "Video transcription was not generated yet" });
    const promptMessage = prompt.replace("{transcription}", video.transcription);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      temperature,
      messages: [
        { role: "user", content: promptMessage }
      ],
      stream: true
    });
    const stream = (0, import_ai.OpenAIStream)(response);
    (0, import_ai.streamToResponse)(stream, res.raw, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
      }
    });
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateAICompletionRoute
});
