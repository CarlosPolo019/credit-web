import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../lib/format.js";
import { Button } from "../../ui/Button.jsx";
import { Input } from "../../ui/Input.jsx";
import { PortraitCopilot } from "../../ui/illustrations/portraits.jsx";
import { assistantCopy, lessonBeats } from "./assistant.copy.js";
import { runAssistantTurn } from "./assistant.engine.js";

function LessonBeats({ onFinish }) {
  const [index, setIndex] = useState(0);
  const beat = lessonBeats[index];
  const isLast = index === lessonBeats.length - 1;

  return (
    <Stack className="assistant-lesson" spacing={2.5}>
      <Box>
        <Typography variant="overline">{`Nota ${index + 1} de ${lessonBeats.length}`}</Typography>
        <Typography variant="h6">{beat.title}</Typography>
        <Typography variant="body2" className="muted">{beat.body}</Typography>
      </Box>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button variant="text" onClick={onFinish}>{assistantCopy.skip}</Button>
        <Button onClick={() => (isLast ? onFinish() : setIndex((current) => current + 1))}>
          {isLast ? assistantCopy.done : assistantCopy.next}
        </Button>
      </Stack>
    </Stack>
  );
}

function MessageCard({ message, onAction }) {
  return (
    <Stack className={`assistant-msg assistant-msg--${message.role}`} spacing={1.25}>
      <Typography variant="body2">{message.text}</Typography>
      {message.estimate ? (
        <Box className="assistant-card">
          <Typography variant="overline">Estimación</Typography>
          <Typography variant="body2">{formatCurrency(message.estimate.amount)} · {message.estimate.interestRate}% · {message.estimate.termMonths} meses</Typography>
          <Typography variant="h6">{formatCurrency(message.estimate.monthlyPayment)}</Typography>
          <Typography variant="caption" className="muted">Cuota mensual · total {formatCurrency(message.estimate.totalToPay)}</Typography>
        </Box>
      ) : null}
      {message.credits?.length ? (
        <Stack className="assistant-card" spacing={1}>
          {message.credits.map((credit) => (
            <button
              key={credit.id}
              type="button"
              className="assistant-credit"
              onClick={() => onAction(`/credits/${credit.id}`)}
            >
              <span>{credit.clientName || credit.clientDocument}</span>
              <strong>{formatCurrency(credit.amount)}</strong>
            </button>
          ))}
        </Stack>
      ) : null}
      {message.actions?.length ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {message.actions.map((action) => (
            <Button key={action.to} variant="outlined" size="small" onClick={() => onAction(action.to)}>
              {action.label}
            </Button>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

export function AssistantDock({ isAdmin, onHush, showLesson }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [pendingEstimate, setPendingEstimate] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [messages, setMessages] = useState([]);
  const requestId = useRef(0);

  const prompts = [
    assistantCopy.prompts.register,
    assistantCopy.prompts.limits,
    assistantCopy.prompts.estimate,
    assistantCopy.prompts.search,
    ...(isAdmin ? [assistantCopy.prompts.dashboard] : []),
  ];

  const go = (to) => {
    if (to) navigate(to);
  };

  const submit = async (text) => {
    const trimmed = String(text ?? "").trim();
    if (!trimmed || isWorking) return;
    const turnId = requestId.current + 1;
    requestId.current = turnId;
    setDraft("");
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setIsWorking(true);
    try {
      const result = await runAssistantTurn({ text: trimmed, isAdmin, pendingEstimate });
      if (requestId.current !== turnId) return;
      setPendingEstimate(result.pendingEstimate);
      setMessages((current) => [...current, result.message]);
      if (result.navigateTo) navigate(result.navigateTo);
    } catch (error) {
      if (requestId.current !== turnId) return;
      setMessages((current) => [...current, { role: "assistant", text: error.message || "No se pudo completar la solicitud." }]);
    } finally {
      if (requestId.current === turnId) setIsWorking(false);
    }
  };

  return (
    <aside className="assistant-dock">
      <header className="assistant-dock__header">
        <Stack direction="row" spacing={1.25} alignItems="center">
          <PortraitCopilot size={40} />
          <Box>
            <Typography variant="subtitle1">{assistantCopy.title}</Typography>
            <Typography variant="caption" className="muted">{assistantCopy.subtitle}</Typography>
          </Box>
        </Stack>
        <Button variant="text" size="small" onClick={onHush}>{assistantCopy.hushes}</Button>
      </header>

      <div className="assistant-dock__body">
        {showLesson ? (
          <LessonBeats onFinish={onHush} />
        ) : (
          <Stack spacing={2}>
            {messages.length === 0 ? (
              <Stack className="assistant-msg assistant-msg--assistant" spacing={1.25}>
                <Typography variant="body2">{assistantCopy.welcome}</Typography>
              </Stack>
            ) : null}
            {messages.map((message, index) => (
              <MessageCard key={`${message.role}-${index}`} message={message} onAction={go} />
            ))}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {prompts.map((prompt) => (
                <button key={prompt} type="button" className="assistant-prompt" onClick={() => submit(prompt)}>
                  {prompt}
                </button>
              ))}
            </Stack>
          </Stack>
        )}
      </div>

      {showLesson ? null : (
        <form
          className="assistant-dock__composer"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(draft);
          }}
        >
          <Input
            name="assistantDraft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={assistantCopy.placeholder}
            size="small"
          />
          <IconButton type="submit" aria-label={assistantCopy.send} disabled={isWorking || !draft.trim()}>
            <SendOutlinedIcon fontSize="small" />
          </IconButton>
        </form>
      )}
    </aside>
  );
}
