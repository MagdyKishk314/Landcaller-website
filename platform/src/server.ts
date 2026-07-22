import { createApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

const app = createApp();

app.listen(config.port, () => {
  logger.info("landcaller-platform listening", { port: config.port, prod: config.isProd });
});
