import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import {
  GET_PROJECT_QUERY,
  GET_EXPENSES_QUERY,
  GET_INCOMES_QUERY,
  GET_BUDGET_REPORT_QUERY,
} from '../graphql/queries';
import {
  CREATE_EXPENSE_MUTATION,
  UPDATE_EXPENSE_MUTATION,
  DELETE_EXPENSE_MUTATION,
  CREATE_INCOME_MUTATION,
  UPDATE_INCOME_MUTATION,
  DELETE_INCOME_MUTATION,
} from '../graphql/mutations';
import { ProjectFinancePage } from '../pages/ProjectFinancePage';

export function ProjectFinanceContainer() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const { data: projectData } = useQuery(GET_PROJECT_QUERY, {
    variables: { id: projectId },
  });

  const {
    data: expenseData,
    loading: expensesLoading,
    error: expensesError,
  } = useQuery(GET_EXPENSES_QUERY, { variables: { projectId } });

  const {
    data: incomeData,
    loading: incomesLoading,
    error: incomesError,
  } = useQuery(GET_INCOMES_QUERY, { variables: { projectId } });

  const [fetchBudgetReport, { data: budgetData, loading: budgetLoading, error: budgetError }] =
    useLazyQuery(GET_BUDGET_REPORT_QUERY, { fetchPolicy: 'network-only' });

  const budgetReport = budgetData?.budgetReport ?? [];

  const onOpenBudget = () => fetchBudgetReport({ variables: { projectId } });

  const [createExpense] = useMutation(CREATE_EXPENSE_MUTATION, {
    update(cache, { data }) {
      const existing = cache.readQuery({ query: GET_EXPENSES_QUERY, variables: { projectId } });
      if (!existing || !data) return;
      cache.writeQuery({
        query: GET_EXPENSES_QUERY,
        variables: { projectId },
        data: { expenses: [...existing.expenses, data.createExpense] },
      });
    },
  });
  const [updateExpense] = useMutation(UPDATE_EXPENSE_MUTATION);
  const [deleteExpense] = useMutation(DELETE_EXPENSE_MUTATION, {
    update(cache, _, { variables }) {
      const existing = cache.readQuery({ query: GET_EXPENSES_QUERY, variables: { projectId } });
      if (!existing) return;
      cache.writeQuery({
        query: GET_EXPENSES_QUERY,
        variables: { projectId },
        data: { expenses: existing.expenses.filter((e) => e.id !== variables?.id) },
      });
    },
  });
  const [createIncome] = useMutation(CREATE_INCOME_MUTATION, {
    update(cache, { data }) {
      const existing = cache.readQuery({ query: GET_INCOMES_QUERY, variables: { projectId } });
      if (!existing || !data) return;
      cache.writeQuery({
        query: GET_INCOMES_QUERY,
        variables: { projectId },
        data: { incomes: [...existing.incomes, data.createIncome] },
      });
    },
  });
  const [updateIncome] = useMutation(UPDATE_INCOME_MUTATION);
  const [deleteIncome] = useMutation(DELETE_INCOME_MUTATION, {
    update(cache, _, { variables }) {
      const existing = cache.readQuery({ query: GET_INCOMES_QUERY, variables: { projectId } });
      if (!existing) return;
      cache.writeQuery({
        query: GET_INCOMES_QUERY,
        variables: { projectId },
        data: { incomes: existing.incomes.filter((e) => e.id !== variables?.id) },
      });
    },
  });

  return (
    <ProjectFinancePage
      projectId={projectId}
      ownerId={projectData?.project?.ownerId}
      expenses={expenseData?.expenses ?? []}
      incomes={incomeData?.incomes ?? []}
      loading={expensesLoading || incomesLoading}
      error={(expensesError || incomesError)?.message}
      onCreateExpense={(v) => createExpense({ variables: { projectId, ...v } })}
      onUpdateExpense={(id, v) => updateExpense({ variables: { id, ...v } })}
      onDeleteExpense={(id) => deleteExpense({ variables: { id } })}
      onCreateIncome={(v) => createIncome({ variables: { projectId, ...v } })}
      onUpdateIncome={(id, v) => updateIncome({ variables: { id, ...v } })}
      onDeleteIncome={(id) => deleteIncome({ variables: { id } })}
      budgetReport={budgetReport}
      budgetLoading={budgetLoading}
      budgetError={budgetError?.message}
      onOpenBudget={onOpenBudget}
    />
  );
}
