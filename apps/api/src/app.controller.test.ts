import { describe, expect, it } from "vitest";

import { AppController } from "./app.controller.js";

describe("AppController", () => {
  it("returns a scaffold health check", () => {
    expect(new AppController().health()).toEqual({
      service: "api",
      status: "ok"
    });
  });
});
