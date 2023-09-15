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

// src/routes/get-videos.ts
var get_videos_exports = {};
__export(get_videos_exports, {
  getVideosRoute: () => getVideosRoute
});
module.exports = __toCommonJS(get_videos_exports);

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/routes/get-videos.ts
async function getVideosRoute(app) {
  app.get("/videos", async () => {
    const videos = await prisma.video.findMany();
    return videos;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getVideosRoute
});
