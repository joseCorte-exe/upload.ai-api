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

// src/routes/create-transcription.ts
var create_transcription_exports = {};
__export(create_transcription_exports, {
  createTranscriptionRoute: () => createTranscriptionRoute
});
module.exports = __toCommonJS(create_transcription_exports);
var import_fs = require("fs");
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

// src/routes/create-transcription.ts
async function createTranscriptionRoute(app) {
  app.post("/videos/:videoId/transcription", async (req) => {
    const paramsSchema = import_zod.z.object({
      videoId: import_zod.z.string().uuid()
    });
    const { videoId } = paramsSchema.parse(req.params);
    const bodySchema = import_zod.z.object({
      prompt: import_zod.z.string()
    });
    const { prompt } = bodySchema.parse(req.body);
    const video = await prisma.video.findFirstOrThrow({
      where: {
        id: videoId
      }
    });
    const videoPath = video.path;
    const audioReadStream = (0, import_fs.createReadStream)(videoPath);
    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: "pt",
      response_format: "json",
      temperature: 0,
      prompt
    });
    const transcription = response.text;
    await prisma.video.update({
      where: {
        id: videoId
      },
      data: {
        transcription
      }
    });
    return { transcription };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createTranscriptionRoute
});
