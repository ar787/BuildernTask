import { gql } from "@apollo/client";

export const GET_PROJECTS_QUERY = gql`
  query GetProjects {
    projects {
      id
      name
      location
      ownerId
      owner {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;
