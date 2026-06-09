import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

type Invitation = {
  id: number;
  invitedEmail: string;
  createdAt: string;
};

type SentInvitationsListProps = {
  invitations: Invitation[];
  loading: boolean;
};

export function SentInvitationsList({
  invitations,
  loading,
}: Readonly<SentInvitationsListProps>) {
  if (loading) return <CircularProgress />;

  if (invitations.length === 0)
    return (
      <Typography color="text.secondary">No pending invitations.</Typography>
    );

  return (
    <List dense>
      {invitations.map((inv) => (
        <ListItem key={inv.id}>
          <ListItemText
            primary={inv.invitedEmail}
            secondary={`Pending · Sent ${new Date(inv.createdAt).toLocaleDateString()}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
