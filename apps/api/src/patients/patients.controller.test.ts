import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { PatientsController } from "./patients.controller.js";
import { PatientsService } from "./patients.service.js";

function createController() {
  return new PatientsController(new PatientsService());
}

describe("PatientsController", () => {
  it("creates a patient", () => {
    const controller = createController();

    const patient = controller.create({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "555-0100"
    });

    expect(patient).toMatchObject({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "555-0100"
    });
    expect(patient.id).toEqual(expect.any(String));
    expect(patient.createdAt).toEqual(expect.any(String));
    expect(patient.updatedAt).toEqual(expect.any(String));
  });

  it("lists patients", () => {
    const controller = createController();
    const created = controller.create({ fullName: "Grace Hopper" });

    expect(controller.list()).toEqual([created]);
  });

  it("gets a patient by id", () => {
    const controller = createController();
    const created = controller.create({ fullName: "Katherine Johnson" });

    expect(controller.get(created.id)).toEqual(created);
  });

  it("throws not found for a missing patient id", () => {
    const controller = createController();

    expect(() => controller.get("missing-id")).toThrow(NotFoundException);
  });

  it("updates a patient", () => {
    const controller = createController();
    const created = controller.create({
      fullName: "Marie Curie",
      email: "marie@example.com"
    });

    const updated = controller.update(created.id, {
      fullName: "Marie Sklodowska Curie",
      email: "curie@example.com"
    });

    expect(updated).toMatchObject({
      id: created.id,
      fullName: "Marie Sklodowska Curie",
      email: "curie@example.com"
    });
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.updatedAt).getTime()
    );
  });

  it("rejects invalid email on create", () => {
    const controller = createController();

    expect(() =>
      controller.create({ fullName: "Invalid Email", email: "not-an-email" })
    ).toThrow(BadRequestException);
  });

  it("rejects an empty full name", () => {
    const controller = createController();

    expect(() => controller.create({ fullName: "" })).toThrow(
      BadRequestException
    );
  });
});
