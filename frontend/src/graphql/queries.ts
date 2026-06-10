import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';
import type { Project, Invitation, Entry, BudgetLine } from '../types';

export const GET_PROJECTS_QUERY: TypedDocumentNode<
  { projects: Project[] },
  Record<string, never>
> = gql`
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

export const GET_PROJECT_QUERY: TypedDocumentNode<{ project: Project }, { id: number }> = gql`
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

export const GET_INVITATIONS_QUERY: TypedDocumentNode<
  { invitations: Invitation[] },
  { projectId: number }
> = gql`
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
        createdAt
      }
      sender {
        id
        name
        email
      }
    }
  }
`;

export const GET_EXPENSES_QUERY: TypedDocumentNode<{ expenses: Entry[] }, { projectId: number }> =
  gql`
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

export const GET_INCOMES_QUERY: TypedDocumentNode<{ incomes: Entry[] }, { projectId: number }> =
  gql`
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

export const GET_BUDGET_REPORT_QUERY: TypedDocumentNode<
  { budgetReport: BudgetLine[] },
  { projectId: number }
> = gql`
  query GetBudgetReport($projectId: Int!) {
    budgetReport(projectId: $projectId) {
      name
      totalExpense
      totalIncome
      difference
    }
  }
`;

export const GET_RECEIVED_INVITATIONS_QUERY: TypedDocumentNode<
  { receivedInvitations: Invitation[] },
  Record<string, never>
> = gql`
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
