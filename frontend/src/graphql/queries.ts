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

export const GET_INVITATIONS_QUERY = gql`
  query GetInvitations($projectId: Int!) {
    invitations(projectId: $projectId) {
      id
      projectId
      invitedEmail
      status
      createdAt
      project {
        id
        name
        location
      }
      sender {
        id
        name
        email
      }
    }
  }
`;

export const GET_EXPENSES_QUERY = gql`
  query GetExpenses($projectId: Int!) {
    expenses(projectId: $projectId) {
      id
      name
      amount
      userId
      createdAt
      user {
        id
        name
      }
    }
  }
`;

export const GET_INCOMES_QUERY = gql`
  query GetIncomes($projectId: Int!) {
    incomes(projectId: $projectId) {
      id
      name
      amount
      userId
      createdAt
      user {
        id
        name
      }
    }
  }
`;

export const GET_RECEIVED_INVITATIONS_QUERY = gql`
  query GetReceivedInvitations {
    receivedInvitations {
      id
      projectId
      invitedEmail
      status
      createdAt
      project {
        id
        name
        location
      }
      sender {
        id
        name
        email
      }
    }
  }
`;
