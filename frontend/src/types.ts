export type ProjectOwner = { id: number; name: string; email: string };

export type ProjectMember = {
  id: number;
  userId: number;
  joinedAt: string;
  user: ProjectOwner;
};

export type Project = {
  id: number;
  name: string;
  location: string;
  ownerId: number;
  owner: ProjectOwner;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
};

export type Invitation = {
  id: number;
  projectId: number;
  invitedEmail: string;
  status: string;
  createdAt: string;
  project: Pick<Project, 'id' | 'name' | 'location' | 'createdAt'>;
  sender: ProjectOwner;
};

export type Entry = {
  id: number;
  name: string;
  amount: number;
  userId: number;
  createdAt: string;
  user: Pick<ProjectOwner, 'id' | 'name'>;
};

export type BudgetLine = {
  name: string;
  totalExpense: number;
  totalIncome: number;
  difference: number;
};
