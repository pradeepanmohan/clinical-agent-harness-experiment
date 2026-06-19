import { describe, expect, it } from "vitest";

import { healthCheckSchema } from "./index.js";

describe("healthCheckSchema", () => {
  it("accepts the scaffold health check shape", () => {
    expect(
      healthCheckSchema.parse({ service: "api", status: "ok" })
    ).toEqual({ service: "api", status: "ok" });
  });

  it("rejects an empty service name", () => {
    expect(() =>
      healthCheckSchema.parse({ service: "", status: "ok" })
    ).toThrow();
  });
});
