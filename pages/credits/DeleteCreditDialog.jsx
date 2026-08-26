import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MuiButton from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Button } from "../../ui/Button.jsx";

export function DeleteCreditDialog({ open, clientName, onCancel, onConfirm, isDeleting }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth className="credit-form-dialog">
      <DialogTitle className="credit-form__title">
        <Stack spacing={0.5} className="credit-form__title-copy">
          <Typography variant="overline">Eliminar crédito</Typography>
          <Typography variant="h5">¿Eliminar este crédito?</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers className="credit-form__content">
        <Typography variant="body2" className="muted">
          Se eliminará el crédito de <strong>{clientName}</strong>. Esta acción no se puede deshacer desde el panel.
        </Typography>
      </DialogContent>
      <DialogActions className="credit-form__actions">
        <MuiButton onClick={onCancel} color="inherit" disabled={isDeleting}>
          Cancelar
        </MuiButton>
        <Button onClick={onConfirm} color="error" loading={isDeleting} loadingText="Eliminando...">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
