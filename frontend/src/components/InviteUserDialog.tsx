import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

type FormValues = yup.InferType<typeof schema>;

type InviteUserDialogProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
};

export function InviteUserDialog({ open, onClose, onInvite }: Readonly<InviteUserDialogProps>) {
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const handleInvite = async (values: FormValues) => {
    setError(undefined);
    setInviting(true);
    try {
      await onInvite(values.email);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Invite User</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the email of the user you want to invite to this project.
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="dense"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={handleSubmit(handleInvite)} disabled={inviting}>
          {inviting ? 'Inviting…' : 'Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
