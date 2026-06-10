import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

const schema = yup.object({
  name: yup.string().min(1).required('Name is required'),
  location: yup.string().min(1).required('Location is required'),
});

type FormValues = yup.InferType<typeof schema>;

type CreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; location: string }) => Promise<void>;
};

export function CreateProjectDialog({
  open,
  onClose,
  onSubmit,
}: Readonly<CreateProjectDialogProps>) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const handleCreate = async (values: FormValues) => {
    setError(undefined);
    setCreating(true);
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>New Project</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleCreate)}>
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
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Location"
            fullWidth
            margin="dense"
            {...register('location')}
            error={!!errors.location}
            helperText={errors.location?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={creating}>
            {creating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
