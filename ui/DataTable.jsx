import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

const MAX_STAGGER_INDEX = 10;
const STAGGER_STEP_MS = 25;

export function DataTable({
  columns,
  rows,
  getRowId,
  renderCell,
  isLoading,
  emptyText = "No hay registros para mostrar.",
  loadingText = "Cargando créditos...",
  countLabel = "créditos visibles",
  sortBy,
  direction,
  onSortChange,
  onRowClick,
  removingRowId,
}) {
  if (isLoading && rows.length === 0) {
    return (
      <Fade in appear timeout={200}>
        <Box className="table-state">
          <LinearProgress />
          <Typography variant="body2">{loadingText}</Typography>
        </Box>
      </Fade>
    );
  }

  if (!rows.length) {
    return (
      <Fade in appear timeout={200}>
        <Box className="table-state">
          <Typography variant="body2">{emptyText}</Typography>
        </Box>
      </Fade>
    );
  }

  return (
    <Box className="data-table">
      {isLoading ? <LinearProgress className="data-table__progress" /> : null}
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => {
              const active = sortBy === column.sortKey;
              const sortDirection = active ? (direction === "asc" ? "ascending" : "descending") : "none";
              return (
                <TableCell key={column.key} aria-sort={column.sortKey ? sortDirection : undefined}>
                  {column.sortKey ? (
                    <button
                      aria-label={`Ordenar por ${column.label}${active ? `, dirección actual ${direction}` : ""}`}
                      className="data-table__sort"
                      type="button"
                      onClick={() => onSortChange(column.sortKey)}
                    >
                      {column.label}
                      {active && direction === "asc" ? <ArrowUpwardIcon /> : null}
                      {active && direction === "desc" ? <ArrowDownwardIcon /> : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody className={`data-table__body${isLoading ? " data-table__body--loading" : ""}`}>
          {rows.map((row, index) => {
            const rowId = getRowId(row);
            const isRemoving = removingRowId != null && rowId === removingRowId;
            return (
              <TableRow
                key={rowId}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`data-table__row${isRemoving ? " data-table__row--removing" : ""}`}
                style={{ "--row-delay": `${Math.min(index, MAX_STAGGER_INDEX) * STAGGER_STEP_MS}ms` }}
                sx={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>{renderCell(row, column.key)}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Stack className="data-table__footer" direction="row" justifyContent="space-between">
        <Typography variant="caption">{rows.length} {countLabel}</Typography>
      </Stack>
    </Box>
  );
}
