import { creditLimits } from "../../lib/creditValidation.js";

const amountLabel = `$${creditLimits.maxAmount.toLocaleString("es-CO")}`;

export const lessonBeats = [
  {
    title: "Te acompaño, no te interrumpo",
    body: "Este panel enseña los límites del crédito, estima una cuota con la API real y te señala el siguiente paso. Tres notas y me retiro.",
  },
  {
    title: "Límites reales del crédito",
    body: `Valor mayor que cero y hasta ${amountLabel}. Tasa mensual entre ${creditLimits.minInterestRate}% y ${creditLimits.maxInterestRate}%. Plazo de ${creditLimits.minTermMonths} a ${creditLimits.maxTermMonths} meses. La cédula solo admite dígitos.`,
  },
  {
    title: "Siguiente paso",
    body: "Pedime una estimación con valor, tasa y plazo, o abrí Registrar crédito. El comercial viaja en tu sesión, no en el formulario.",
  },
];

export const assistantCopy = {
  title: "Copiloto",
  subtitle: "Límites, cuota y el siguiente paso",
  hushes: "Ocultar",
  open: "Copiloto",
  skip: "Saltar",
  next: "Siguiente",
  done: "Entendido",
  placeholder: "Preguntá por un límite, una cuota o un crédito…",
  send: "Enviar",
  thinking: "Consultando…",
  welcome: "Puedo explicar cómo registrar un crédito, estimar una cuota o buscar en el listado. ¿Qué necesitás?",
  prompts: {
    register: "Cómo registro un crédito",
    limits: "Cuáles son los límites",
    estimate: "Estima 8.000.000 al 2% a 24 meses",
    search: "Busca créditos recientes",
    dashboard: "Llévame al dashboard",
  },
  helpRegister: [
    "En Créditos, usá Registrar crédito.",
    "La cédula va primero y solo admite dígitos; si ya existe, el nombre se completa solo.",
    `Valor mayor que cero y hasta ${amountLabel}. Tasa mensual ${creditLimits.minInterestRate}%–${creditLimits.maxInterestRate}%. Plazo ${creditLimits.minTermMonths}–${creditLimits.maxTermMonths} meses.`,
    "Antes de guardar, la API estima la cuota. El comercial no se envía: sale del JWT.",
  ].join(" "),
  helpLimits: `Los límites son los del producto: valor > 0 y ≤ ${amountLabel}; tasa mensual ${creditLimits.minInterestRate}%–${creditLimits.maxInterestRate}%; plazo ${creditLimits.minTermMonths}–${creditLimits.maxTermMonths} meses; cédula solo dígitos.`,
  askEstimate: `Para estimar necesito valor, tasa mensual (${creditLimits.minInterestRate}–${creditLimits.maxInterestRate}) y plazo en meses (${creditLimits.minTermMonths}–${creditLimits.maxTermMonths}).`,
  estimateMissing: (missing) => `Me falta ${missing.join(", ")} para pedir la cuota a la API.`,
  estimateOk: "Cuota y total los calcula el backend. No reestimés a mano.",
  searchEmpty: "No hay créditos activos con esos filtros.",
  searchOk: (count) => count === 1 ? "Encontré 1 crédito activo." : `Encontré ${count} créditos activos.`,
  navigateAdminOnly: "Esa vista es solo para administradores.",
  createAccountAdmin: "Las cuentas de prueba se crean en Usuarios. No hay auto-registro público.",
  createAccountUser: "No hay auto-registro. Pedile a un administrador que cree la cuenta en Usuarios.",
  unknown: "Puedo enseñarte a registrar un crédito, estimar una cuota o buscar en el listado. Probá con una de las sugerencias.",
  openRegister: "Abrir registro",
  viewList: "Ver en créditos",
  viewDetail: "Ver detalle",
  go: "Ir",
};

export const FORBIDDEN_REGISTER_PATH = "/auth/register";
