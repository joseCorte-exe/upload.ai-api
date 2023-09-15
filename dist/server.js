var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_cors = require("@fastify/cors");
var import_fastify = require("fastify");

// src/routes/create-transcription.ts
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
async function createTranscriptionRoute(app2) {
  app2.post("/videos/:videoId/transcription", async (req) => {
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

// src/routes/generate-ai-completion.ts
var import_ai = require("ai");
var import_zod2 = require("zod");
async function generateAICompletionRoute(app2) {
  app2.post("/ai/generate", async (req, res) => {
    const bodySchema = import_zod2.z.object({
      videoId: import_zod2.z.string().uuid(),
      prompt: import_zod2.z.string(),
      temperature: import_zod2.z.number().min(0).max(1).default(0.5)
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

// src/routes/get-all-prompts.ts
async function getAllPromptsRoute(app2) {
  app2.get("/prompts", async () => {
    const prompts = await prisma.prompt.findMany();
    return prompts;
  });
}

// src/routes/get-videos.ts
async function getVideosRoute(app2) {
  app2.get("/videos", async () => {
    const videos = await prisma.video.findMany();
    return videos;
  });
}

// src/routes/upload-video.ts
var import_multipart = require("@fastify/multipart");
var import_node_crypto = require("crypto");
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var import_node_stream = require("stream");
var import_node_util = require("util");
var pipeline = (0, import_node_util.promisify)(import_node_stream.pipeline);
async function uploadVideoRoute(app2) {
  app2.register(import_multipart.fastifyMultipart, {
    limits: {
      fileSize: 1048576 * 25
    }
  });
  app2.post("/upload", async (req, res) => {
    const data = await req.file();
    if (!data) {
      return res.status(400).send({ error: "Missing file input" });
    }
    const extension = import_node_path.default.extname(data.filename);
    if (extension !== ".mp3")
      return res.status(400).send({ error: "Invalid input type, please upload a MP3" });
    const fileBaseName = import_node_path.default.basename(data.filename, extension);
    const fileUploadName = `${fileBaseName}-${(0, import_node_crypto.randomUUID)()}${extension}`;
    const uploadDestination = import_node_path.default.resolve(__dirname, "../../tmp", fileUploadName);
    await pipeline(data.file, import_node_fs.default.createWriteStream(uploadDestination));
    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination
      }
    });
    return {
      video
    };
  });
}

// src/server.ts
var app = (0, import_fastify.fastify)();
app.register(import_cors.fastifyCors, {
  origin: "*"
});
app.register(getVideosRoute);
app.register(uploadVideoRoute);
app.register(getAllPromptsRoute);
app.register(createTranscriptionRoute);
app.register(generateAICompletionRoute);
app.listen({
  port: 3333
}).then(() => {
  console.log("HTTP server runnig in http://localhost:3333");
});
