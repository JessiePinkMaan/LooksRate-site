/** Единая проверка: приложение собрано для Cloudflare Workers. */
export const isWorkersDeployment =
  process.env.CF_WORKERS === "true" || process.env.CF_WORKERS === "1";
