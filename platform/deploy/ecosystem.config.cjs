// PM2 process definition for the platform service.
// On the VPS: pm2 start deploy/ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: "landcaller-platform",
      cwd: __dirname + "/..",
      script: "dist/server.js",
      env: {
        NODE_ENV: "production",
        APP_ENV: "production",
        PORT: 3100,
      },
      max_restarts: 10,
      restart_delay: 2000,
      // Phase 2+: add a second app entry "landcaller-platform-worker" running
      // dist/worker.js for the node-cron schedules.
    },
  ],
};
