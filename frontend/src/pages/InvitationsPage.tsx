import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Invitation = {
  id: number;
  projectId: number;
  invitedEmail: string;
  status: string;
  createdAt: string;
  project: { id: number; name: string; location: string };
  sender: { id: number; name: string; email: string };
};

type InvitationsPageProps = {
  invitations: Invitation[];
  loading: boolean;
  error?: string;
  onRespond: (id: number, accept: boolean) => Promise<void>;
};

export function InvitationsPage({
  invitations,
  loading,
  error,
  onRespond,
}: Readonly<InvitationsPageProps>) {
  const navigate = useNavigate();
  const [responding, setResponding] = useState(false);

  const handleRespond = async (id: number, accept: boolean) => {
    setResponding(true);
    try {
      await onRespond(id, accept);
    } finally {
      setResponding(false);
    }
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => navigate("/projects")}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Invitations
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && invitations.length === 0 && (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", mt: 6 }}
          >
            No pending invitations.
          </Typography>
        )}

        <List>
          {invitations.map((inv) => (
            <ListItem
              key={inv.id}
              secondaryAction={
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={responding}
                    onClick={() => handleRespond(inv.id, true)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={responding}
                    onClick={() => handleRespond(inv.id, false)}
                  >
                    Reject
                  </Button>
                </Box>
              }
            >
              <ListItemText
                primary={`You've been invited to "${inv.project.name}"`}
                secondary={`By ${inv.sender.name} (${inv.sender.email}) · ${new Date(inv.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </>
  );
}
