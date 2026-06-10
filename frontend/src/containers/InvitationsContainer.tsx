import { useQuery, useMutation } from "@apollo/client/react";
import { GET_RECEIVED_INVITATIONS_QUERY } from "../graphql/queries";
import { RESPOND_INVITATION_MUTATION } from "../graphql/mutations";
import { InvitationsPage } from "../pages/InvitationsPage";

export function InvitationsContainer() {
  const { data, loading, error } = useQuery(GET_RECEIVED_INVITATIONS_QUERY);

  const [respondToInvitation] = useMutation(RESPOND_INVITATION_MUTATION, {
    update(cache, _, { variables }) {
      const existing = cache.readQuery({ query: GET_RECEIVED_INVITATIONS_QUERY });
      if (!existing) return;
      cache.writeQuery({
        query: GET_RECEIVED_INVITATIONS_QUERY,
        data: {
          receivedInvitations: existing.receivedInvitations.filter(
            (i) => i.id !== variables?.id,
          ),
        },
      });
    },
  });

  const onRespond = async (id: number, accept: boolean) => {
    await respondToInvitation({ variables: { id, accept } });
  };

  return (
    <InvitationsPage
      invitations={data?.receivedInvitations ?? []}
      loading={loading}
      error={error?.message}
      onRespond={onRespond}
    />
  );
}
