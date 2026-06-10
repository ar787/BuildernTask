import { useQuery, useMutation } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { GET_PROJECT_QUERY, GET_INVITATIONS_QUERY, GET_PROJECTS_QUERY } from '../graphql/queries';
import {
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
  INVITE_USER_MUTATION,
} from '../graphql/mutations';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';

export function ProjectDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const {
    data: projectData,
    loading,
    error,
  } = useQuery(GET_PROJECT_QUERY, {
    variables: { id: projectId },
  });

  const { data: invitationsData, loading: invitationsLoading } = useQuery(GET_INVITATIONS_QUERY, {
    variables: { projectId },
  });

  const [updateProject] = useMutation(UPDATE_PROJECT_MUTATION);

  const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION, {
    update(cache, _, { variables }) {
      const existing = cache.readQuery({ query: GET_PROJECTS_QUERY });
      if (!existing) return;
      cache.writeQuery({
        query: GET_PROJECTS_QUERY,
        data: {
          projects: existing.projects.filter((p) => p.id !== variables?.id),
        },
      });
    },
  });

  const [inviteUser] = useMutation(INVITE_USER_MUTATION, {
    update(cache, { data }) {
      const existing = cache.readQuery({
        query: GET_INVITATIONS_QUERY,
        variables: { projectId },
      });
      if (!existing || !data) return;
      cache.writeQuery({
        query: GET_INVITATIONS_QUERY,
        variables: { projectId },
        data: { invitations: [...existing.invitations, data.inviteUserToProject] },
      });
    },
  });

  const onUpdate = async (values: { name?: string; location?: string }) => {
    await updateProject({ variables: { id: projectId, ...values } });
  };

  const onDelete = async () => {
    await deleteProject({ variables: { id: projectId } });
  };

  const onInvite = async (email: string) => {
    await inviteUser({ variables: { projectId, email } });
  };

  return (
    <ProjectDetailPage
      project={projectData?.project}
      loading={loading}
      error={error?.message}
      invitations={invitationsData?.invitations ?? []}
      invitationsLoading={invitationsLoading}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onInvite={onInvite}
    />
  );
}
