import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

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
}) {
  if (isLoading && rows.length === 0) {
    return (
      <Box className="table-state">
        <LinearProgress />
        <Typography variant="body2">{loadingText}</Typography>
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Box className="table-state">
        <Typography variant="body2">{emptyText}</Typography>
      </Box>
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
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)} hover>
              {columns.map((column) => (
                <TableCell key={column.key}>{renderCell(row, column.key)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack className="data-table__footer" direction="row" justifyContent="space-between">
        <Typography variant="caption">{rows.length} {countLabel}</Typography>
      </Stack>
    </Box>
  );
}
