import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  GET_PROJECT_QUERY,
  GET_PROJECTS_QUERY,
  GET_INVITATIONS_QUERY,
} from "../graphql/queries";
import {
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
  INVITE_USER_MUTATION,
} from "../graphql/mutations";
import { useAuth } from "../hooks/useAuth";

const editSchema = yup.object({
  name: yup.string().min(1).required("Name is required"),
  location: yup.string().min(1).required("Location is required"),
});

const emailSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

type EditFormValues = yup.InferType<typeof editSchema>;
type EmailFormValues = yup.InferType<typeof emailSchema>;

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const projectId = Number(id);

  const { data, loading, error } = useQuery(GET_PROJECT_QUERY, {
    variables: { id: projectId },
  });

  const { data: invitationsData, loading: invitationsLoading } = useQuery(
    GET_INVITATIONS_QUERY,
    { variables: { projectId } },
  );

  const [updateProject, { loading: updating, error: updateError }] =
    useMutation(UPDATE_PROJECT_MUTATION);

  const [inviteUser, { loading: inviting }] = useMutation(INVITE_USER_MUTATION);

  const [deleteProject, { loading: deleting }] = useMutation(
    DELETE_PROJECT_MUTATION,
    {
      refetchQueries: [GET_PROJECTS_QUERY],
      onCompleted: () => navigate("/projects"),
    },
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({ resolver: yupResolver(editSchema) });

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormValues>({ resolver: yupResolver(emailSchema) });

  const project = data?.project;
  const isOwner = project?.ownerId === user?.id;

  const handleEdit = () => {
    reset({ name: project.name, location: project.location });
    setEditOpen(true);
  };

  const handleUpdate = async (values: EditFormValues) => {
    await updateProject({ variables: { id: projectId, ...values } });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await deleteProject({ variables: { id: projectId } });
  };

  const handleInvite = async (values: EmailFormValues) => {
    await inviteUser({ variables: { projectId, email: values.email } });
    resetEmail();
    setInviteOpen(false);
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error)
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error.message}
      </Alert>
    );
  if (!project) return null;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => navigate("/projects")}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            {project.name}
          </Typography>
          {isOwner && (
            <>
              <IconButton color="inherit" onClick={() => setInviteOpen(true)}>
                <PersonAddIcon />
              </IconButton>
              <IconButton color="inherit" onClick={handleEdit}>
                <EditIcon />
              </IconButton>
              <IconButton color="inherit" onClick={() => setDeleteOpen(true)}>
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Location:</strong> {project.location}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Owner:</strong> {project.owner.name} ({project.owner.email})
        </Typography>
        {!isOwner && <Chip label="Member" size="small" sx={{ mt: 1 }} />}

        {isOwner && (
          <>
            <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
              Sent Invitations
            </Typography>
            {invitationsLoading ? (
              <CircularProgress />
            ) : invitationsData?.invitations.length === 0 ? (
              <Typography color="text.secondary">
                No pending invitations.
              </Typography>
            ) : (
              <List dense>
                {invitationsData.invitations.map(
                    (inv: {
                      id: number;
                      invitedEmail: string;
                      createdAt: string;
                    }) => (
                      <ListItem key={inv.id}>
                        <ListItemText
                          primary={inv.invitedEmail}
                          secondary={`Pending · Sent ${new Date(inv.createdAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ),
                  )}
              </List>
            )}
          </>
        )}

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
          Members
        </Typography>
        {project.members.length === 0 ? (
          <Typography color="text.secondary">No members yet.</Typography>
        ) : (
          <List dense>
            {project.members.map(
              (m: { id: number; user: { name: string; email: string } }) => (
                <ListItem key={m.id}>
                  <ListItemText
                    primary={m.user.name}
                    secondary={m.user.email}
                  />
                </ListItem>
              ),
            )}
          </List>
        )}
      </Container>

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Project</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handleUpdate)}>
          <DialogContent>
            {updateError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updateError.message}
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
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updating}>
              {updating ? "Saving…" : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{project.name}"? This cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite user dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the email of the user you want to invite to this project.
          </DialogContentText>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="dense"
            {...registerEmail("email")}
            error={!!emailErrors.email}
            helperText={emailErrors.email?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button
            color="primary"
            onClick={handleSubmitEmail(handleInvite)}
            disabled={inviting}
          >
            {inviting ? "Inviting…" : "Invite"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
