import React from "react";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type BudgetLine = {
  name: string;
  totalExpense: number;
  totalIncome: number;
  difference: number;
};

type BudgetReportDialogProps = {
  open: boolean;
  onClose: () => void;
  budgetReport: BudgetLine[];
  loading: boolean;
};

export function BudgetReportDialog({
  open,
  onClose,
  budgetReport,
  loading,
}: Readonly<BudgetReportDialogProps>) {
  let content: React.ReactNode;
  if (loading) {
    content = <CircularProgress />;
  } else if (budgetReport.length === 0) {
    content = <Typography color="text.secondary">No data yet.</Typography>;
  } else {
    content = (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Expense</TableCell>
            <TableCell align="right">Income</TableCell>
            <TableCell align="right">Difference</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {budgetReport.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">${row.totalExpense.toFixed(2)}</TableCell>
              <TableCell align="right">${row.totalIncome.toFixed(2)}</TableCell>
              <TableCell
                align="right"
                sx={{ color: row.difference >= 0 ? "success.main" : "error.main" }}
              >
                {row.difference >= 0 ? "+" : ""}${row.difference.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Budget Report</DialogTitle>
      <DialogContent>{content}</DialogContent>
    </Dialog>
  );
}
