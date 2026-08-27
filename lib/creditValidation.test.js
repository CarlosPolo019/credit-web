import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateCreditForm } from "./creditValidation.js";

describe("validateCreditForm", () => {
  it("normalizes a valid payload", () => {
    const result = validateCreditForm({
      clientFirstName: "  Pepito ",
      clientSecondName: "",
      clientFirstSurname: " Perez ",
      clientSecondSurname: "",
      clientDocument: " 100000001 ",
      amount: "7800000",
      interestRate: "2",
      termMonths: "10",
    });

    assert.equal(result.isValid, true);
    assert.equal(result.value.clientFirstName, "Pepito");
    assert.equal(result.value.clientFirstSurname, "Perez");
    assert.equal(result.value.clientDocument, "100000001");
    assert.equal(result.value.amount, 7800000);
  });

  it("rejects invalid numeric values", () => {
    const result = validateCreditForm({
      clientFirstName: "",
      clientSecondName: "",
      clientFirstSurname: "",
      clientSecondSurname: "",
      clientDocument: "",
      amount: "0",
      interestRate: "-1",
      termMonths: "0",
    });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.amount, "El valor debe ser mayor que cero.");
  });

  it("rejects amount over the max, and rate/term outside their bounds", () => {
    const result = validateCreditForm({
      clientFirstName: "Pepito",
      clientSecondName: "",
      clientFirstSurname: "Perez",
      clientSecondSurname: "",
      clientDocument: "100000001",
      amount: "200000001",
      interestRate: "4",
      termMonths: "61",
    });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.amount, "El valor del crédito no puede superar 200.000.000.");
    assert.equal(result.errors.interestRate, "La tasa de interés mensual no puede superar 3.5%.");
    assert.equal(result.errors.termMonths, "El plazo no puede superar 60 meses.");
  });

  it("accepts the max bounds exactly", () => {
    const result = validateCreditForm({
      clientFirstName: "Pepito",
      clientSecondName: "",
      clientFirstSurname: "Perez",
      clientSecondSurname: "",
      clientDocument: "100000001",
      amount: "200000000",
      interestRate: "3.5",
      termMonths: "60",
    });

    assert.equal(result.isValid, true);
  });

  it("rejects non-numeric client document", () => {
    const result = validateCreditForm({
      clientFirstName: "Pepito",
      clientSecondName: "",
      clientFirstSurname: "Perez",
      clientSecondSurname: "",
      clientDocument: "ABC-123",
      amount: "7800000",
      interestRate: "2",
      termMonths: "10",
    });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.clientDocument, "La cédula o ID debe contener solo números.");
  });
});
