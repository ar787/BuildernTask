import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const schema = yup.object({
  name: yup.string().min(1).required("Name is required"),
  location: yup.string().min(1).required("Location is required"),
});

type FormValues = yup.InferType<typeof schema>;

type EditProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  project: { name: string; location: string };
  onSubmit: (values: { name?: string; location?: string }) => Promise<void>;
};

export function EditProjectDialog({
  open,
  onClose,
  project,
  onSubmit,
}: Readonly<EditProjectDialogProps>) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    values: { name: project.name, location: project.location },
  });

  const handleUpdate = async (values: FormValues) => {
    setError(undefined);
    setSaving(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleUpdate)}>
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
            label="Location"
            fullWidth
            margin="dense"
            {...register("location")}
            error={!!errors.location}
            helperText={errors.location?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
