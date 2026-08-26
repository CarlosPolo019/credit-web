import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateCreditPayment } from "./creditPayment.js";

describe("estimateCreditPayment", () => {
  it("computes a fixed monthly installment for a standard rate", () => {
    const { monthlyPayment, totalToPay } = estimateCreditPayment({
      amount: 1000000,
      interestRate: 2,
      termMonths: 12,
    });

    assert.ok(Math.abs(monthlyPayment - 94559.5966) < 0.01, `unexpected monthlyPayment: ${monthlyPayment}`);
    assert.ok(Math.abs(totalToPay - monthlyPayment * 12) < 0.01);
  });

  it("falls back to a straight split when the rate is zero", () => {
    const { monthlyPayment, totalToPay } = estimateCreditPayment({
      amount: 1200000,
      interestRate: 0,
      termMonths: 12,
    });

    assert.equal(monthlyPayment, 100000);
    assert.equal(totalToPay, 1200000);
  });

  it("returns zero for a missing or non-positive term", () => {
    const result = estimateCreditPayment({ amount: 1000000, interestRate: 2, termMonths: 0 });
    assert.deepEqual(result, { monthlyPayment: 0, totalToPay: 0 });
  });
});
