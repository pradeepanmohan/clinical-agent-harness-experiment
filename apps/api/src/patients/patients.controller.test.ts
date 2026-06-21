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

  it("lists all patients when no query is provided", () => {
    const controller = createController();
    const patient1 = controller.create({ fullName: "Alice Smith", email: "alice@example.com" });
    const patient2 = controller.create({ fullName: "Bob Jones", phone: "555-0200" });

    expect(controller.list()).toEqual([patient1, patient2]);
  });

  it("filters patients by full name case-insensitively", () => {
    const controller = createController();
    const patient1 = controller.create({ fullName: "Alice Smith" });
    controller.create({ fullName: "Bob Jones" });

    const results = controller.list("alice");
    expect(results).toEqual([patient1]);
  });

  it("filters patients by email case-insensitively", () => {
    const controller = createController();
    const patient1 = controller.create({ fullName: "Alice Smith", email: "alice@example.com" });
    controller.create({ fullName: "Bob Jones", email: "bob@example.com" });

    const results = controller.list("ALICE@");
    expect(results).toEqual([patient1]);
  });

  it("filters patients by phone", () => {
    const controller = createController();
    const patient1 = controller.create({ fullName: "Alice Smith", phone: "555-0100" });
    controller.create({ fullName: "Bob Jones", phone: "555-0200" });

    const results = controller.list("555-0100");
    expect(results).toEqual([patient1]);
  });

  it("returns empty list when no patients match search query", () => {
    const controller = createController();
    controller.create({ fullName: "Alice Smith" });
    controller.create({ fullName: "Bob Jones" });

    const results = controller.list("Charlie");
    expect(results).toEqual([]);
  });

  it("returns all patients when query is empty string", () => {
    const controller = createController();
    const patient1 = controller.create({ fullName: "Alice Smith" });
    const patient2 = controller.create({ fullName: "Bob Jones" });

    const results = controller.list("");
    expect(results).toEqual([patient1, patient2]);
  });
});
