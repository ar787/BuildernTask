import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PROJECTS_QUERY } from '../graphql/queries';
import { CREATE_PROJECT_MUTATION } from '../graphql/mutations';
import { ProjectsPage } from '../pages/ProjectsPage';

export function ProjectsContainer() {
  const { data, loading, error } = useQuery(GET_PROJECTS_QUERY);

  const [createProject] = useMutation(CREATE_PROJECT_MUTATION, {
    update(cache, { data }) {
      const existing = cache.readQuery({ query: GET_PROJECTS_QUERY });
      if (!existing || !data) return;
      cache.writeQuery({
        query: GET_PROJECTS_QUERY,
        data: { projects: [...existing.projects, data.createProject] },
      });
    },
  });

  const onCreate = async (values: { name: string; location: string }) => {
    await createProject({ variables: values });
  };

  return (
    <ProjectsPage
      projects={data?.projects ?? []}
      loading={loading}
      error={error?.message}
      onCreate={onCreate}
    />
  );
}
