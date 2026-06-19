import { describe, expect, it } from "vitest";

import { healthCheckSchema } from "@clinical/shared";

describe("web scaffold health", () => {
  it("uses the shared health check contract", () => {
    expect(
      healthCheckSchema.parse({ service: "web", status: "ok" })
    ).toEqual({ service: "web", status: "ok" });
  });
});
