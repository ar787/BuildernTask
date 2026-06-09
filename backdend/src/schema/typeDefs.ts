export const typeDefs = `#graphql
  type User {
    id: Int!
    email: String!
    name: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ProjectMember {
    id: Int!
    userId: Int!
    projectId: Int!
    joinedAt: String!
    user: User!
  }

  type Invitation {
    id: Int!
    projectId: Int!
    invitedEmail: String!
    invitedUserId: Int
    senderId: Int!
    status: String!
    createdAt: String!
    project: Project!
    sender: User!
  }

  type Project {
    id: Int!
    name: String!
    location: String!
    ownerId: Int!
    owner: User!
    members: [ProjectMember!]!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    me: User
    projects: [Project!]!
    project(id: Int!): Project
    invitations(projectId: Int!): [Invitation!]!
    receivedInvitations: [Invitation!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createProject(name: String!, location: String!): Project!
    updateProject(id: Int!, name: String, location: String): Project!
    deleteProject(id: Int!): Boolean!
    inviteUserToProject(projectId: Int!, email: String!): Invitation!
    respondToInvitation(id: Int!, accept: Boolean!): Invitation!
  }
`;
