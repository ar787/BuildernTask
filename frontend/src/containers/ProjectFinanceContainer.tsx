import { useQuery, useMutation } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import {
  GET_PROJECT_QUERY,
  GET_EXPENSES_QUERY,
  GET_INCOMES_QUERY,
} from "../graphql/queries";
import {
  CREATE_EXPENSE_MUTATION,
  UPDATE_EXPENSE_MUTATION,
  DELETE_EXPENSE_MUTATION,
  CREATE_INCOME_MUTATION,
  UPDATE_INCOME_MUTATION,
  DELETE_INCOME_MUTATION,
} from "../graphql/mutations";
import { ProjectFinancePage } from "../pages/ProjectFinancePage";

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

  const expenseRefetch = { query: GET_EXPENSES_QUERY, variables: { projectId } };
  const incomeRefetch = { query: GET_INCOMES_QUERY, variables: { projectId } };

  const [createExpense] = useMutation(CREATE_EXPENSE_MUTATION, { refetchQueries: [expenseRefetch] });
  const [updateExpense] = useMutation(UPDATE_EXPENSE_MUTATION, { refetchQueries: [expenseRefetch] });
  const [deleteExpense] = useMutation(DELETE_EXPENSE_MUTATION, { refetchQueries: [expenseRefetch] });
  const [createIncome] = useMutation(CREATE_INCOME_MUTATION, { refetchQueries: [incomeRefetch] });
  const [updateIncome] = useMutation(UPDATE_INCOME_MUTATION, { refetchQueries: [incomeRefetch] });
  const [deleteIncome] = useMutation(DELETE_INCOME_MUTATION, { refetchQueries: [incomeRefetch] });

  return (
    <ProjectFinancePage
      projectId={projectId}
      ownerId={(projectData as any)?.project?.ownerId}
      expenses={(expenseData as any)?.expenses ?? []}
      incomes={(incomeData as any)?.incomes ?? []}
      loading={expensesLoading || incomesLoading}
      error={(expensesError || incomesError)?.message}
      onCreateExpense={(v) => createExpense({ variables: { projectId, ...v } })}
      onUpdateExpense={(id, v) => updateExpense({ variables: { id, ...v } })}
      onDeleteExpense={(id) => deleteExpense({ variables: { id } })}
      onCreateIncome={(v) => createIncome({ variables: { projectId, ...v } })}
      onUpdateIncome={(id, v) => updateIncome({ variables: { id, ...v } })}
      onDeleteIncome={(id) => deleteIncome({ variables: { id } })}
    />
  );
}
