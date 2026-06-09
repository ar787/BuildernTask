import { useQuery } from "@apollo/client/react";
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { GET_INVITATIONS_QUERY } from "../graphql/queries";

interface SentInvitationsListProps {
  projectId: number;
}

export function SentInvitationsList({
  projectId,
}: Readonly<SentInvitationsListProps>) {
  const { data, loading } = useQuery(GET_INVITATIONS_QUERY, {
    variables: { projectId },
  });

  if (loading) return <CircularProgress />;

  if (data?.invitations.length === 0)
    return (
      <Typography color="text.secondary">No pending invitations.</Typography>
    );

  return (
    <List dense>
      {data?.invitations.map(
        (inv: { id: number; invitedEmail: string; createdAt: string }) => (
          <ListItem key={inv.id}>
            <ListItemText
              primary={inv.invitedEmail}
              secondary={`Pending · Sent ${new Date(inv.createdAt).toLocaleDateString()}`}
            />
          </ListItem>
        ),
      )}
    </List>
  );
}
