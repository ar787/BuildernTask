import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";

const schema = yup.object({
  name: yup.string().min(1).required("Name is required"),
  amount: yup
    .number()
    .positive("Must be positive")
    .required("Amount is required"),
});

type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; amount: number }) => Promise<void>;
  type: "expense" | "income";
  loading?: boolean;
  error?: string;
  initial?: { name: string; amount: number };
}

export function FinanceEntryDialog({
  open,
  onClose,
  onSubmit,
  type,
  loading,
  error,
  initial,
}: Props) {
  const isEdit = !!initial;
  const label = type === "expense" ? "Expense" : "Income";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (open) reset(initial ?? { name: "", amount: 0 });
  }, [open, initial, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? `Edit ${label}` : `Add ${label}`}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="dense"
            inputProps={{ step: "0.01", min: "0" }}
            {...register("amount")}
            error={!!errors.amount}
            helperText={errors.amount?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
