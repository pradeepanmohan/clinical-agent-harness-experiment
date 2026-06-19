import { describe, expect, it } from "vitest";

import { getDatabaseUrl } from "./config.js";

describe("getDatabaseUrl", () => {
  it("returns DATABASE_URL when configured", () => {
    expect(
      getDatabaseUrl({
        DATABASE_URL: "postgresql://clinical:clinical@localhost:5432/clinical"
      })
    ).toBe("postgresql://clinical:clinical@localhost:5432/clinical");
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() => getDatabaseUrl({})).toThrow("DATABASE_URL is required");
  });
});
