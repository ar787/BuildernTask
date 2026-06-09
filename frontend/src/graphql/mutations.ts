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
