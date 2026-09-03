import { estimateCredit, listCredits } from "../credits/credits.service.js";
import { normalizeDirection, normalizeSort, validateCreditTerms } from "../../lib/creditValidation.js";
import { assistantCopy } from "./assistant.copy.js";

const ADMIN_PATHS = {
  dashboard: "/dashboard",
  estadisticas: "/dashboard",
  correos: "/email-jobs",
  emails: "/email-jobs",
  "email-jobs": "/email-jobs",
  notificaciones: "/email-jobs",
  clientes: "/clients",
  directorio: "/clients",
  usuarios: "/users",
  cuentas: "/users",
};

function fold(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function definedFields(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== ""));
}

export function parseNumberEs(raw) {
  const text = String(raw ?? "").trim().replace(/\s/g, "");
  if (!text) return Number.NaN;
  if (/^\d{1,3}(\.\d{3})+$/.test(text)) return Number(text.replace(/\./g, ""));
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(text)) return Number(text.replace(/\./g, "").replace(",", "."));
  if (/^\d+,\d+$/.test(text)) return Number(text.replace(",", "."));
  return Number(text);
}

export function extractCreditTerms(text) {
  const source = String(text ?? "");
  const folded = fold(source);
  const terms = {};

  const millions = folded.match(/(\d+(?:[.,]\d+)?)\s*millones?/);
  if (millions) {
    terms.amount = Math.round(parseNumberEs(millions[1]) * 1_000_000);
  }

  if (terms.amount == null) {
    const labeled = source.match(/(?:\$|valor|monto|credito|crédito)\s*([\d.]+(?:,\d+)?)/i);
    if (labeled) {
      const amount = parseNumberEs(labeled[1]);
      if (Number.isFinite(amount) && amount > 0) terms.amount = amount;
    }
  }

  if (terms.amount == null) {
    const grouped = source.match(/\b(\d{1,3}(?:\.\d{3}){2,})\b/);
    if (grouped) terms.amount = parseNumberEs(grouped[1]);
  }

  if (terms.amount == null) {
    const plain = source.match(/\b(\d{4,})\b/);
    if (plain) terms.amount = Number(plain[1]);
  }

  const rateMatch = folded.match(/(\d+(?:[.,]\d+)?)\s*%/)
    || folded.match(/tasa(?:\s+de)?\s+(\d+(?:[.,]\d+)?)/)
    || folded.match(/(\d+(?:[.,]\d+)?)\s*por\s*ciento/);
  if (rateMatch) {
    const rate = parseNumberEs(rateMatch[1]);
    if (Number.isFinite(rate)) terms.interestRate = rate;
  }

  const termMatch = folded.match(/(\d+)\s*meses/)
    || folded.match(/plazo(?:\s+de)?\s+(\d+)/)
    || folded.match(/a\s+(\d+)\s*mes/);
  if (termMatch) {
    const termMonths = Number(termMatch[1]);
    if (Number.isInteger(termMonths)) terms.termMonths = termMonths;
  }

  return terms;
}

export function extractCreditSearch(text) {
  const source = String(text ?? "");
  const folded = fold(source);
  const filters = {
    clientName: "",
    clientDocument: "",
    salesperson: "",
    sortBy: "createdAt",
    direction: "desc",
  };

  const documentMatch = source.match(/(?:c[eé]dula|documento|id)\s*(?:n[uú]m(?:ero)?\.?)?\s*(\d{5,20})/i);
  if (documentMatch) filters.clientDocument = documentMatch[1];

  const salespersonMatch = source.match(/comercial(?:\s+de)?\s+([a-záéíóúñü\s]+)/i);
  if (salespersonMatch) {
    filters.salesperson = salespersonMatch[1].replace(/\s+(orden|por|cedula|cédula|documento).*$/i, "").trim();
  }

  const nameMatch = source.match(/(?:cliente|nombre)\s+([a-záéíóúñü\s]+)/i)
    || source.match(/cr[eé]ditos?\s+de\s+(?!cr[eé]dito)([a-záéíóúñü\s]+)/i);
  if (nameMatch) {
    filters.clientName = nameMatch[1]
      .replace(/\s+(orden|por|cedula|cédula|documento|comercial|tasa|plazo).*$/i, "")
      .trim();
  }

  if (/\b(monto|valor|amount|caros?)\b/.test(folded)) filters.sortBy = "amount";
  if (/\b(fecha|reciente|antiguo|createdat)\b/.test(folded)) filters.sortBy = "createdAt";
  filters.sortBy = normalizeSort(filters.sortBy);

  if (/\b(asc|antigu|menor|barat)/.test(folded)) filters.direction = "asc";
  if (/\b(desc|reciente|mayor|caro)/.test(folded)) filters.direction = "desc";
  filters.direction = normalizeDirection(filters.direction);

  return filters;
}

function extractCreditId(text) {
  const match = String(text ?? "").match(/(?:credito|crédito|detalle)\s+([a-zA-Z0-9_-]{8,})/i);
  return match?.[1] ?? "";
}

export function parseAssistantIntent(text) {
  const folded = fold(text);
  if (!folded) return { type: "unknown" };

  if (/(crear|creo|nueva).*(cuenta|usuario)|registrar\s+usuario|auto-?registro/.test(folded)) {
    return { type: "create_account" };
  }

  if (/(como|ayuda).*(registr)|registrar un credito|nuevo credito|abrir (el )?formulario|registrar credito/.test(folded)
    && !/(estima|cuota|busca|lista)/.test(folded)) {
    if (/(como|ayuda|limites|requisitos)/.test(folded)) return { type: "help_register" };
    return { type: "open_register" };
  }

  if (/(limites|requisitos|que puedo|que acepta)/.test(folded)) return { type: "limits" };

  if (/(ir a|abrir|llevame|navega|ver )/.test(folded)
    && /(dashboard|estadisticas|correos|emails|clientes|usuarios|creditos|directorio)/.test(folded)) {
    return { type: "navigate", query: folded };
  }
  if (/^(dashboard|correos|clientes|usuarios|creditos)$/.test(folded)) {
    return { type: "navigate", query: folded };
  }

  const creditId = extractCreditId(text);
  if (creditId && /(ver|abrir|detalle|credito)/.test(folded)) {
    return { type: "open_detail", id: creditId };
  }

  if (/(estima|estimar|cuota|simula|simular|calcula|calcular)/.test(folded)) {
    return { type: "estimate", terms: extractCreditTerms(text) };
  }

  if (/(busca|buscar|lista|listar|mostrar|encuentra|filtr)/.test(folded) || /creditos (de|reciente|activo)/.test(folded)) {
    return { type: "search", filters: extractCreditSearch(text) };
  }

  const terms = extractCreditTerms(text);
  if (terms.amount && terms.interestRate && terms.termMonths) {
    return { type: "estimate", terms };
  }

  if (/(ayuda|que puedes|que podes|hola|copiloto)/.test(folded)) return { type: "help" };

  return { type: "unknown" };
}

function missingTermLabels(terms) {
  const missing = [];
  if (terms.amount == null) missing.push("el valor");
  if (terms.interestRate == null) missing.push("la tasa");
  if (terms.termMonths == null) missing.push("el plazo");
  return missing;
}

function resolveNavigation(query, isAdmin) {
  const folded = fold(query);
  if (/(registrar|nuevo credito|formulario)/.test(folded)) {
    return { to: "/credits?nuevo=1", label: assistantCopy.openRegister };
  }
  if (/(credito)/.test(folded)) {
    return { to: "/credits", label: assistantCopy.viewList };
  }
  for (const [key, path] of Object.entries(ADMIN_PATHS)) {
    if (folded.includes(key)) {
      if (!isAdmin) return { error: assistantCopy.navigateAdminOnly };
      return { to: path, label: assistantCopy.go };
    }
  }
  return { to: "/credits", label: assistantCopy.viewList };
}

function reply(text, extras = {}) {
  return {
    message: { role: "assistant", text, ...extras },
    pendingEstimate: extras.pendingEstimate ?? null,
    navigateTo: extras.navigateTo ?? null,
  };
}

export async function runAssistantTurn({ text, isAdmin = false, pendingEstimate = null }, deps = {}) {
  const estimate = deps.estimateCredit ?? estimateCredit;
  const list = deps.listCredits ?? listCredits;
  const intent = parseAssistantIntent(text);

  if (intent.type === "create_account") {
    if (isAdmin) {
      return reply(assistantCopy.createAccountAdmin, {
        actions: [{ type: "navigate", to: "/users", label: "Ir a Usuarios" }],
        navigateTo: "/users",
      });
    }
    return reply(assistantCopy.createAccountUser);
  }

  if (intent.type === "help_register" || intent.type === "help") {
    const helpText = intent.type === "help_register" ? assistantCopy.helpRegister : assistantCopy.welcome;
    return reply(helpText, {
      actions: [{ type: "navigate", to: "/credits?nuevo=1", label: assistantCopy.openRegister }],
    });
  }

  if (intent.type === "limits") {
    return reply(assistantCopy.helpLimits, {
      actions: [{ type: "navigate", to: "/credits?nuevo=1", label: assistantCopy.openRegister }],
    });
  }

  if (intent.type === "open_register") {
    return reply("Te abro el formulario de registro.", {
      actions: [{ type: "navigate", to: "/credits?nuevo=1", label: assistantCopy.openRegister }],
      navigateTo: "/credits?nuevo=1",
    });
  }

  if (intent.type === "open_detail") {
    return reply("Te llevo al detalle de ese crédito.", {
      actions: [{ type: "navigate", to: `/credits/${intent.id}`, label: assistantCopy.viewDetail }],
      navigateTo: `/credits/${intent.id}`,
    });
  }

  if (intent.type === "navigate") {
    const navigation = resolveNavigation(intent.query, isAdmin);
    if (navigation.error) return reply(navigation.error);
    return reply("Te llevo a esa vista.", {
      actions: [{ type: "navigate", to: navigation.to, label: navigation.label }],
      navigateTo: navigation.to,
    });
  }

  if (intent.type === "estimate") {
    const merged = { ...pendingEstimate, ...definedFields(intent.terms) };
    const missing = missingTermLabels(merged);
    if (missing.length) {
      return reply(pendingEstimate || Object.keys(intent.terms).length
        ? assistantCopy.estimateMissing(missing)
        : assistantCopy.askEstimate, { pendingEstimate: merged });
    }

    const validation = validateCreditTerms(merged);
    if (!validation.isValid) {
      return reply(Object.values(validation.errors).join(" "), { pendingEstimate: merged });
    }

    const payload = validation.value;
    const response = await estimate({
      amount: payload.amount,
      interestRate: payload.interestRate,
      termMonths: payload.termMonths,
    });

    return reply(assistantCopy.estimateOk, {
      estimate: {
        amount: payload.amount,
        interestRate: payload.interestRate,
        termMonths: payload.termMonths,
        monthlyPayment: response.monthlyPayment,
        totalToPay: response.totalToPay,
      },
      actions: [{ type: "navigate", to: "/credits?nuevo=1", label: assistantCopy.openRegister }],
      pendingEstimate: null,
    });
  }

  if (intent.type === "search") {
    const filters = intent.filters;
    const response = await list(filters, { signal: deps.signal });
    const items = response.items ?? [];
    const params = new URLSearchParams();
    if (filters.clientName) params.set("clientName", filters.clientName);
    if (filters.clientDocument) params.set("clientDocument", filters.clientDocument);
    if (filters.salesperson) params.set("salesperson", filters.salesperson);
    params.set("sortBy", normalizeSort(filters.sortBy));
    params.set("direction", normalizeDirection(filters.direction));
    const listPath = `/credits?${params.toString()}`;

    if (!items.length) {
      return reply(assistantCopy.searchEmpty, {
        actions: [{ type: "navigate", to: listPath, label: assistantCopy.viewList }],
      });
    }

    return reply(assistantCopy.searchOk(items.length), {
      credits: items.slice(0, 5),
      creditTotal: items.length,
      actions: [{ type: "navigate", to: listPath, label: assistantCopy.viewList }],
    });
  }

  const leftoverTerms = extractCreditTerms(text);
  if (pendingEstimate && (leftoverTerms.amount || leftoverTerms.interestRate || leftoverTerms.termMonths)) {
    return runAssistantTurn({
      text: `estima ${text}`,
      isAdmin,
      pendingEstimate,
    }, deps);
  }

  return reply(assistantCopy.unknown, {
    actions: [{ type: "navigate", to: "/credits?nuevo=1", label: assistantCopy.openRegister }],
  });
}

export function buildCreditsListPath(filters) {
  const params = new URLSearchParams();
  if (filters.clientName) params.set("clientName", filters.clientName);
  if (filters.clientDocument) params.set("clientDocument", filters.clientDocument);
  if (filters.salesperson) params.set("salesperson", filters.salesperson);
  params.set("sortBy", normalizeSort(filters.sortBy));
  params.set("direction", normalizeDirection(filters.direction));
  return `/credits?${params.toString()}`;
}
