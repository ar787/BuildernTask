import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  CircularProgress,
  Container,
  IconButton,
  Typography,
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useAuth } from '../hooks/useAuth';
import { EditProjectDialog } from '../components/EditProjectDialog';
import { DeleteProjectDialog } from '../components/DeleteProjectDialog';
import { InviteUserDialog } from '../components/InviteUserDialog';
import { SentInvitationsList } from '../components/SentInvitationsList';

type Member = {
  id: number;
  user: { name: string; email: string };
};

type Project = {
  id: number;
  name: string;
  location: string;
  ownerId: number;
  owner: { id: number; name: string; email: string };
  members: Member[];
};

type Invitation = {
  id: number;
  invitedEmail: string;
  createdAt: string;
};

type ProjectDetailPageProps = {
  project: Project | undefined;
  loading: boolean;
  error?: string;
  invitations: Invitation[];
  invitationsLoading: boolean;
  onUpdate: (values: { name?: string; location?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onInvite: (email: string) => Promise<void>;
};

export function ProjectDetailPage({
  project,
  loading,
  error,
  invitations,
  invitationsLoading,
  onUpdate,
  onDelete,
  onInvite,
}: Readonly<ProjectDetailPageProps>) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const isOwner = project?.ownerId === user?.id;

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error)
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  if (!project) return null;

  const handleDelete = async () => {
    await onDelete();
    navigate('/projects');
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => navigate('/projects')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            {project.name}
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate(`/projects/${project.id}/finance`)}
            startIcon={<MonetizationOnIcon />}
          >
            Finance
          </Button>
          {isOwner && (
            <>
              <IconButton color="inherit" onClick={() => setInviteOpen(true)}>
                <PersonAddIcon />
              </IconButton>
              <IconButton color="inherit" onClick={() => setEditOpen(true)}>
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
            <SentInvitationsList invitations={invitations} loading={invitationsLoading} />
          </>
        )}

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
          Members
        </Typography>
        {project.members.length === 0 ? (
          <Typography color="text.secondary">No members yet.</Typography>
        ) : (
          <List dense>
            {project.members.map((m) => (
              <ListItem key={m.id}>
                <ListItemText primary={m.user.name} secondary={m.user.email} />
              </ListItem>
            ))}
          </List>
        )}
      </Container>

      <EditProjectDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
        onSubmit={onUpdate}
      />
      <DeleteProjectDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        projectName={project.name}
        onDelete={handleDelete}
      />
      <InviteUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={onInvite}
      />
    </>
  );
}
