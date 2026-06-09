import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
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
} from "@mui/material";
import { SentInvitationsList } from "../components/SentInvitationsList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { GET_PROJECT_QUERY } from "../graphql/queries";
import { useAuth } from "../hooks/useAuth";
import { EditProjectDialog } from "../components/EditProjectDialog";
import { DeleteProjectDialog } from "../components/DeleteProjectDialog";
import { InviteUserDialog } from "../components/InviteUserDialog";

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

  const project = data?.project;
  const isOwner = project?.ownerId === user?.id;

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
          <Button
            color="inherit"
            onClick={() => navigate(`/projects/${projectId}/finance`)}
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
            <SentInvitationsList projectId={projectId} />
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

      <EditProjectDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
      />
      <DeleteProjectDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        projectId={projectId}
        projectName={project.name}
      />
      <InviteUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectId={projectId}
      />
    </>
  );
}
