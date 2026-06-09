import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($name: String!, $location: String!) {
    createProject(name: $name, location: $location) {
      id
      name
      location
      ownerId
      createdAt
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: Int!, $name: String, $location: String) {
    updateProject(id: $id, name: $name, location: $location) {
      id
      name
      location
      ownerId
      updatedAt
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: Int!) {
    deleteProject(id: $id)
  }
`;

export const RESPOND_INVITATION_MUTATION = gql`
  mutation RespondToInvitation($id: Int!, $accept: Boolean!) {
    respondToInvitation(id: $id, accept: $accept) {
      id
      status
    }
  }
`;

export const CREATE_EXPENSE_MUTATION = gql`
  mutation CreateExpense($projectId: Int!, $name: String!, $amount: Float!) {
    createExpense(projectId: $projectId, name: $name, amount: $amount) {
      id
      name
      amount
      userId
      createdAt
      user { id name }
    }
  }
`;

export const UPDATE_EXPENSE_MUTATION = gql`
  mutation UpdateExpense($id: Int!, $name: String, $amount: Float) {
    updateExpense(id: $id, name: $name, amount: $amount) {
      id
      name
      amount
      updatedAt
    }
  }
`;

export const DELETE_EXPENSE_MUTATION = gql`
  mutation DeleteExpense($id: Int!) {
    deleteExpense(id: $id)
  }
`;

export const CREATE_INCOME_MUTATION = gql`
  mutation CreateIncome($projectId: Int!, $name: String!, $amount: Float!) {
    createIncome(projectId: $projectId, name: $name, amount: $amount) {
      id
      name
      amount
      userId
      createdAt
      user { id name }
    }
  }
`;

export const UPDATE_INCOME_MUTATION = gql`
  mutation UpdateIncome($id: Int!, $name: String, $amount: Float) {
    updateIncome(id: $id, name: $name, amount: $amount) {
      id
      name
      amount
      updatedAt
    }
  }
`;

export const DELETE_INCOME_MUTATION = gql`
  mutation DeleteIncome($id: Int!) {
    deleteIncome(id: $id)
  }
`;

export const INVITE_USER_MUTATION = gql`
  mutation InviteUserToProject($projectId: Int!, $email: String!) {
    inviteUserToProject(projectId: $projectId, email: $email) {
      id
      projectId
      invitedEmail
      status
      createdAt
      sender {
        id
        name
        email
      }
    }
  }
`;
