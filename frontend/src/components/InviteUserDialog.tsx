import { useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { INVITE_USER_MUTATION } from "../graphql/mutations";
import { GET_INVITATIONS_QUERY } from "../graphql/queries";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: number;
}

export function InviteUserDialog({ open, onClose, projectId }: Props) {
  const [inviteUser, { loading, error }] = useMutation(INVITE_USER_MUTATION, {
    refetchQueries: [{ query: GET_INVITATIONS_QUERY, variables: { projectId } }],
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const handleInvite = async (values: FormValues) => {
    await inviteUser({ variables: { projectId, email: values.email } });
    reset();
    onClose();
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
            {error.message}
          </Alert>
        )}
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="dense"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={handleSubmit(handleInvite)} disabled={loading}>
          {loading ? "Inviting…" : "Invite"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
