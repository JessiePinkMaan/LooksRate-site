// Минимальная типизация биндингов, которые использует приложение.
// Полную версию можно сгенерировать командой `wrangler types`.
interface CloudflareEnv {
  HYPERDRIVE: {
    connectionString: string;
  };
}
