import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateCreditForm } from "./creditValidation.js";

describe("validateCreditForm", () => {
  it("normalizes a valid payload", () => {
    const result = validateCreditForm({
      clientName: "  Pepito   Perez ",
      clientDocument: " SEED-001 ",
      amount: "7800000",
      interestRate: "2",
      termMonths: "10",
      salespersonName: " Comercial Seed ",
    });

    assert.equal(result.isValid, true);
    assert.equal(result.value.clientName, "Pepito Perez");
    assert.equal(result.value.amount, 7800000);
  });

  it("rejects invalid numeric values", () => {
    const result = validateCreditForm({
      clientName: "",
      clientDocument: "",
      amount: "0",
      interestRate: "-1",
      termMonths: "0",
      salespersonName: "",
    });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.amount, "El valor debe ser mayor que cero.");
  });
});
