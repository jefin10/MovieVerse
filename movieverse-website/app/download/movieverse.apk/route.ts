import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

// GET /download/movieverse.apk: the Android app, straight from the server.
// The APK lives outside the site folder (APK_PATH) so deploys never remove it.
const APK_PATH = process.env.APK_PATH ?? `${process.env.HOME}/MovieVerse/downloads/movieverse.apk`;

export const dynamic = "force-dynamic";

export async function GET() {
  const info = await stat(APK_PATH).catch(() => null);
  if (!info?.isFile()) {
    return new Response("The app download is not available right now.", { status: 404 });
  }
  const body = Readable.toWeb(createReadStream(APK_PATH)) as ReadableStream;
  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Length": String(info.size),
      "Content-Disposition": 'attachment; filename="movieverse.apk"',
      "Cache-Control": "no-cache",
      "Last-Modified": info.mtime.toUTCString(),
    },
  });
}
