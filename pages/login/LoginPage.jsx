import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Button } from "../../ui/Button.jsx";
import { Input } from "../../ui/Input.jsx";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "username" ? value.replace(/\D/g, "") : value;
    setValues((previous) => ({ ...previous, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(values.username, values.password);
      const from = location.state?.from;
      const redirectTo = from ? `${from.pathname}${from.search ?? ""}` : "/credits";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login">
      <form className="login__panel" onSubmit={handleSubmit}>
        <Box className="login__brand">
          <img src="/fya-mark.png" alt="Fya" />
          <Typography variant="overline">Fya Social Capital</Typography>
        </Box>
        <Typography variant="h4">Créditos</Typography>
        <Typography variant="body2" className="login__copy">
          Acceso operativo para registro y consulta.
        </Typography>
        <Input
          label="Cédula"
          name="username"
          value={values.username}
          onChange={handleChange}
          autoComplete="username"
          slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
          required
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
        <Collapse in={Boolean(error)} unmountOnExit>
          <div className="form-error">{error}</div>
        </Collapse>
        <Button type="submit" loading={isLoading} loadingText="Ingresando...">
          Ingresar
        </Button>
      </form>
    </section>
  );
}
