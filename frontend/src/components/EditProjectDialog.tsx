import { useMutation } from "@apollo/client/react";
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
import { UPDATE_PROJECT_MUTATION } from "../graphql/mutations";

const schema = yup.object({
  name: yup.string().min(1).required("Name is required"),
  location: yup.string().min(1).required("Location is required"),
});

type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  project: { id: number; name: string; location: string };
}

export function EditProjectDialog({ open, onClose, project }: Props) {
  const [updateProject, { loading, error }] = useMutation(
    UPDATE_PROJECT_MUTATION,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    values: { name: project.name, location: project.location },
  });

  const handleUpdate = async (values: FormValues) => {
    await updateProject({ variables: { id: project.id, ...values } });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleUpdate)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
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
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
