import { Router } from "express";
import type { Logger } from "pino";
import { verifyRouter } from "./verify";
import { sealRouter } from "./seal";
import { contradictRouter } from "./contradict";
import { anchorRouter } from "./anchor";
import { assistantRouter } from "./assistant";

export function v1Router(logger: Logger) {
  const router = Router();

  router.use("/verify", verifyRouter(logger));
  router.use("/seal", sealRouter(logger));
  router.use("/contradict", contradictRouter(logger));
  router.use("/anchor", anchorRouter(logger));
  router.use("/assistant", assistantRouter(logger));

  return router;
}
