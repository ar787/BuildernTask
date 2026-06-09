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

export const GET_PROJECT_QUERY = gql`
  query GetProject($id: Int!) {
    project(id: $id) {
      id
      name
      location
      ownerId
      owner {
        id
        name
        email
      }
      members {
        id
        userId
        joinedAt
        user {
          id
          name
          email
        }
      }
      createdAt
      updatedAt
    }
  }
`;
