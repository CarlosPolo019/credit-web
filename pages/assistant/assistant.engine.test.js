import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assistantCopy, FORBIDDEN_REGISTER_PATH, lessonBeats } from "./assistant.copy.js";
import {
  extractCreditSearch,
  extractCreditTerms,
  parseAssistantIntent,
  parseNumberEs,
  runAssistantTurn,
} from "./assistant.engine.js";

describe("parseNumberEs", () => {
  it("reads Colombian thousands and millions", () => {
    assert.equal(parseNumberEs("8.000.000"), 8_000_000);
    assert.equal(parseNumberEs("10,5"), 10.5);
    assert.equal(parseNumberEs("2"), 2);
  });
});

describe("extractCreditTerms", () => {
  it("reads valor, tasa and plazo from Spanish copy", () => {
    const terms = extractCreditTerms("estima 10 millones al 2% a 24 meses");
    assert.equal(terms.amount, 10_000_000);
    assert.equal(terms.interestRate, 2);
    assert.equal(terms.termMonths, 24);
  });

  it("reads Colombian-formatted amounts and decimal rates", () => {
    const terms = extractCreditTerms("cuota de $8.000.000 tasa 2,5 plazo 36 meses");
    assert.equal(terms.amount, 8_000_000);
    assert.equal(terms.interestRate, 2.5);
    assert.equal(terms.termMonths, 36);
  });
});

describe("extractCreditSearch", () => {
  it("keeps the backend sort allowlist", () => {
    const byAmount = extractCreditSearch("lista créditos por monto más caros");
    assert.equal(byAmount.sortBy, "amount");
    assert.equal(byAmount.direction, "desc");

    const byDate = extractCreditSearch("busca créditos más antiguos");
    assert.equal(byDate.sortBy, "createdAt");
    assert.equal(byDate.direction, "asc");
  });

  it("reads cédula and client name", () => {
    const filters = extractCreditSearch("créditos de Pepito cédula 100000001");
    assert.equal(filters.clientDocument, "100000001");
    assert.equal(filters.clientName, "Pepito");
  });
});

describe("parseAssistantIntent", () => {
  it("maps teaching and navigation intents", () => {
    assert.equal(parseAssistantIntent("cómo registro un crédito").type, "help_register");
    assert.equal(parseAssistantIntent("cuáles son los límites").type, "limits");
    assert.equal(parseAssistantIntent("registrar crédito").type, "open_register");
    assert.equal(parseAssistantIntent("llévame al dashboard").type, "navigate");
    assert.equal(parseAssistantIntent("estima 5 millones al 2% a 12 meses").type, "estimate");
    assert.equal(parseAssistantIntent("busca créditos recientes").type, "search");
    assert.equal(parseAssistantIntent("cómo creo una cuenta").type, "create_account");
  });
});

describe("runAssistantTurn", () => {
  it("estimates only amount, rate and term — never salesperson", async () => {
    const calls = [];
    const result = await runAssistantTurn(
      { text: "estima 8.000.000 al 2% a 24 meses" },
      {
        estimateCredit: async (payload) => {
          calls.push(payload);
          return { monthlyPayment: 380000, totalToPay: 9120000 };
        },
      },
    );

    assert.deepEqual(calls[0], { amount: 8_000_000, interestRate: 2, termMonths: 24 });
    assert.equal(Object.hasOwn(calls[0], "salespersonName"), false);
    assert.equal(result.message.estimate.monthlyPayment, 380000);
    assert.equal(result.message.actions[0].to, "/credits?nuevo=1");
  });

  it("rejects terms outside creditLimits using the shared validator", async () => {
    const result = await runAssistantTurn(
      { text: "estima 200000001 al 4% a 61 meses" },
      { estimateCredit: async () => { throw new Error("should not call estimate"); } },
    );
    assert.match(result.message.text, /200.000.000/);
    assert.equal(result.message.estimate, undefined);
  });

  it("lists credits with allowlisted sort and does not invent a chat endpoint", async () => {
    const result = await runAssistantTurn(
      { text: "busca créditos de Pepito ordenados por monto" },
      {
        listCredits: async (filters) => {
          assert.equal(filters.sortBy, "amount");
          assert.equal(filters.direction, "desc");
          assert.equal(filters.clientName, "Pepito");
          return { items: [{ id: "credit-1", clientName: "Pepito Perez", amount: 8_000_000 }] };
        },
      },
    );
    assert.equal(result.message.credits.length, 1);
    assert.match(result.message.actions[0].to, /sortBy=amount/);
  });

  it("blocks admin routes for USER and never mentions /auth/register", async () => {
    const denied = await runAssistantTurn({ text: "abrir dashboard", isAdmin: false });
    assert.equal(denied.navigateTo, null);
    assert.equal(denied.message.text, assistantCopy.navigateAdminOnly);

    const allowed = await runAssistantTurn({ text: "abrir dashboard", isAdmin: true });
    assert.equal(allowed.navigateTo, "/dashboard");

    const account = await runAssistantTurn({ text: "cómo creo una cuenta", isAdmin: false });
    assert.equal(account.message.text.includes(FORBIDDEN_REGISTER_PATH), false);
    assert.match(account.message.text, /No hay auto-registro/);
  });

  it("collects missing estimate fields across turns", async () => {
    const first = await runAssistantTurn({ text: "estima 10 millones" });
    assert.equal(first.pendingEstimate.amount, 10_000_000);
    const second = await runAssistantTurn({
      text: "tasa 2 plazo 12 meses",
      pendingEstimate: first.pendingEstimate,
    }, {
      estimateCredit: async () => ({ monthlyPayment: 1, totalToPay: 2 }),
    });
    assert.equal(second.message.estimate.termMonths, 12);
    assert.equal(second.pendingEstimate, null);
  });
});

describe("assistant copy", () => {
  it("stays aligned with product limits and never points to public register", () => {
    const blob = [
      ...lessonBeats.map((beat) => `${beat.title} ${beat.body}`),
      assistantCopy.helpRegister,
      assistantCopy.helpLimits,
      assistantCopy.createAccountAdmin,
      assistantCopy.createAccountUser,
    ].join(" ");
    assert.equal(blob.includes(FORBIDDEN_REGISTER_PATH), false);
    assert.match(blob, /200.000.000|200000000/);
    assert.match(blob, /0\.5/);
    assert.match(blob, /3\.5/);
  });
});
