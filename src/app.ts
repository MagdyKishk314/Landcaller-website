import express, { type Application, type Request, type Response } from "express";
import compression from "compression";
import path from "node:path";
import { fileURLToPath } from "node:url";
import routes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1);
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // Vercel edge/CDN already compresses responses.
  if (!process.env.VERCEL) {
    app.use(compression());
  }
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Static assets (css, js, images) reproduced 1:1 from the source site.
  app.use(
    "/assets",
    express.static(path.join(projectRoot, "public", "assets"), {
      maxAge: "1y",
      immutable: true,
    })
  );
  // Favicon and any root-level public files.
  app.use(express.static(path.join(projectRoot, "public")));

  app.use("/", routes);

  // 404 fallback renders the home layout shell to mirror the SPA catch-all.
  app.use((_req: Request, res: Response) => {
    res.status(404).redirect("/");
  });

  return app;
}
