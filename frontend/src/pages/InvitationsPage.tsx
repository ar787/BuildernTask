import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
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
import { GET_RECEIVED_INVITATIONS_QUERY } from "../graphql/queries";
import { RESPOND_INVITATION_MUTATION } from "../graphql/mutations";

interface Invitation {
  id: number;
  projectId: number;
  invitedEmail: string;
  status: string;
  createdAt: string;
  project: { id: number; name: string; location: string };
  sender: { id: number; name: string; email: string };
}

export function InvitationsPage() {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_RECEIVED_INVITATIONS_QUERY);

  const [respondToInvitation, { loading: responding }] = useMutation(
    RESPOND_INVITATION_MUTATION,
    { refetchQueries: [GET_RECEIVED_INVITATIONS_QUERY] },
  );

  const handleRespond = async (id: number, accept: boolean) => {
    await respondToInvitation({ variables: { id, accept } });
  };

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
          <Typography variant="h6" sx={{ ml: 1 }}>
            Invitations
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error.message}</Alert>}

        {!loading && data?.receivedInvitations.length === 0 && (
          <Typography color="text.secondary" textAlign="center" mt={6}>
            No pending invitations.
          </Typography>
        )}

        <List>
          {data?.receivedInvitations.map((inv: Invitation) => (
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
