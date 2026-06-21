import { BadRequestException, NotFoundException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { describe, expect, it } from "vitest";

import { DoctorsController } from "./doctors.controller.js";
import { DoctorsModule } from "./doctors.module.js";

async function createController() {
  const app = await NestFactory.createApplicationContext(DoctorsModule, {
    logger: false
  });

  return app.get(DoctorsController);
}

describe("DoctorsController", () => {
  it("creates a doctor", async () => {
    const controller = await createController();

    const doctor = controller.create({
      fullName: "Dr. Jane Smith",
      specialty: "Cardiology",
      email: "jane@example.com",
      phone: "555-0200"
    });

    expect(doctor).toMatchObject({
      fullName: "Dr. Jane Smith",
      specialty: "Cardiology",
      email: "jane@example.com",
      phone: "555-0200"
    });
    expect(doctor.id).toEqual(expect.any(String));
    expect(doctor.createdAt).toEqual(expect.any(String));
    expect(doctor.updatedAt).toEqual(expect.any(String));
  });

  it("lists doctors", async () => {
    const controller = await createController();
    const created = controller.create({
      fullName: "Dr. Lin Chen",
      specialty: "Pediatrics"
    });

    expect(controller.list()).toEqual([created]);
  });

  it("gets a doctor by id", async () => {
    const controller = await createController();
    const created = controller.create({
      fullName: "Dr. Omar Patel",
      specialty: "Neurology"
    });

    expect(controller.get(created.id)).toEqual(created);
  });

  it("throws not found for a missing doctor id", async () => {
    const controller = await createController();

    expect(() => controller.get("missing-id")).toThrow(NotFoundException);
  });

  it("updates a doctor", async () => {
    const controller = await createController();
    const created = controller.create({
      fullName: "Dr. Maya Rivera",
      specialty: "Internal Medicine",
      email: "maya@example.com"
    });

    const updated = controller.update(created.id, {
      specialty: "Family Medicine",
      email: "rivera@example.com"
    });

    expect(updated).toMatchObject({
      id: created.id,
      fullName: "Dr. Maya Rivera",
      specialty: "Family Medicine",
      email: "rivera@example.com"
    });
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.updatedAt).getTime()
    );
  });

  it("rejects an empty full name", async () => {
    const controller = await createController();

    expect(() =>
      controller.create({ fullName: "", specialty: "Dermatology" })
    ).toThrow(BadRequestException);
  });

  it("rejects an empty specialty", async () => {
    const controller = await createController();

    expect(() =>
      controller.create({ fullName: "Dr. Required Specialty", specialty: "" })
    ).toThrow(BadRequestException);
  });

  it("lists all doctors when no query is provided", async () => {
    const controller = await createController();
    controller.create({ fullName: "Dr. Alice Anderson", specialty: "Cardiology" });
    controller.create({ fullName: "Dr. Bob Brown", specialty: "Neurology" });

    expect(controller.list()).toHaveLength(2);
  });

  it("lists all doctors when query is whitespace", async () => {
    const controller = await createController();
    controller.create({ fullName: "Dr. Alice Anderson", specialty: "Cardiology" });
    controller.create({ fullName: "Dr. Bob Brown", specialty: "Neurology" });

    expect(controller.list("  ")).toHaveLength(2);
  });

  it("filters doctors by full name case-insensitively", async () => {
    const controller = await createController();
    controller.create({ fullName: "Dr. Alice Anderson", specialty: "Cardiology" });
    controller.create({ fullName: "Dr. Bob Brown", specialty: "Neurology" });
    controller.create({ fullName: "Dr. Charlie Chen", specialty: "Pediatrics" });

    const results = controller.list("alice");
    expect(results).toHaveLength(1);
    expect(results[0]?.fullName).toBe("Dr. Alice Anderson");
  });

  it("filters doctors by specialty case-insensitively", async () => {
    const controller = await createController();
    controller.create({ fullName: "Dr. Alice Anderson", specialty: "Cardiology" });
    controller.create({ fullName: "Dr. Bob Brown", specialty: "Neurology" });
    controller.create({ fullName: "Dr. Charlie Chen", specialty: "Cardiology" });

    const results = controller.list("CARDIOLOGY");
    expect(results).toHaveLength(2);
    expect(results.map(d => d.fullName)).toEqual([
      "Dr. Alice Anderson",
      "Dr. Charlie Chen"
    ]);
  });

  it("returns empty list when no doctors match the query", async () => {
    const controller = await createController();
    controller.create({ fullName: "Dr. Alice Anderson", specialty: "Cardiology" });
    controller.create({ fullName: "Dr. Bob Brown", specialty: "Neurology" });

    expect(controller.list("xyz")).toEqual([]);
  });
});


it("wires the doctors module for HTTP requests", async () => {
  const app = await NestFactory.create(DoctorsModule, { logger: false });
  await app.listen(0);
  const address = app.getHttpServer().address();

  if (typeof address === "string" || address === null) {
    throw new Error("Expected HTTP server to listen on a TCP port");
  }

  try {
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const createResponse = await fetch(`${baseUrl}/doctors`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: "Dr. HTTP Smoke",
        specialty: "Emergency Medicine"
      })
    });

    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();

    const getResponse = await fetch(`${baseUrl}/doctors/${created.id}`);
    expect(getResponse.status).toBe(200);
    await expect(getResponse.json()).resolves.toMatchObject({
      id: created.id,
      fullName: "Dr. HTTP Smoke",
      specialty: "Emergency Medicine"
    });
  } finally {
    await app.close();
  }
});
