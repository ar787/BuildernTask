import { useQuery, useMutation } from "@apollo/client/react";
import { GET_PROJECTS_QUERY } from "../graphql/queries";
import { CREATE_PROJECT_MUTATION } from "../graphql/mutations";
import { ProjectsPage } from "../pages/ProjectsPage";

export function ProjectsContainer() {
  const { data, loading, error } = useQuery(GET_PROJECTS_QUERY, {
    fetchPolicy: "network-only",
  });

  const [createProject] = useMutation(CREATE_PROJECT_MUTATION, {
    refetchQueries: [GET_PROJECTS_QUERY],
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
