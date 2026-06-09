import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  AppBar,
  Box,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  GET_EXPENSES_QUERY,
  GET_INCOMES_QUERY,
  GET_PROJECT_QUERY,
} from "../graphql/queries";
import { useAuth } from "../hooks/useAuth";
import {
  CREATE_EXPENSE_MUTATION,
  UPDATE_EXPENSE_MUTATION,
  DELETE_EXPENSE_MUTATION,
  CREATE_INCOME_MUTATION,
  UPDATE_INCOME_MUTATION,
  DELETE_INCOME_MUTATION,
} from "../graphql/mutations";
import { FinanceEntryDialog } from "../components/FinanceEntryDialog";

type Entry = {
  id: number;
  name: string;
  amount: number;
  userId: number;
  createdAt: string;
  user: { id: number; name: string };
};

type DialogState =
  | { open: false }
  | { open: true; type: "expense" | "income"; entry?: Entry };

export function ProjectFinancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);
  const { user } = useAuth();

  const [tab, setTab] = useState<0 | 1>(0);
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [mutationError, setMutationError] = useState<string | undefined>();

  const { data: projectData } = useQuery(GET_PROJECT_QUERY, {
    variables: { id: projectId },
  });

  const ownerId = (projectData as { project?: { ownerId: number } })?.project
    ?.ownerId;
  const canModify = (entry: Entry) => {
    return user?.id === entry.userId || user?.id === ownerId;
  };

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

  const [createExpense, { loading: creatingExpense }] = useMutation(
    CREATE_EXPENSE_MUTATION,
    {
      refetchQueries: [{ query: GET_EXPENSES_QUERY, variables: { projectId } }],
    },
  );
  const [updateExpense, { loading: updatingExpense }] = useMutation(
    UPDATE_EXPENSE_MUTATION,
    {
      refetchQueries: [{ query: GET_EXPENSES_QUERY, variables: { projectId } }],
    },
  );
  const [deleteExpense] = useMutation(DELETE_EXPENSE_MUTATION, {
    refetchQueries: [{ query: GET_EXPENSES_QUERY, variables: { projectId } }],
  });

  const [createIncome, { loading: creatingIncome }] = useMutation(
    CREATE_INCOME_MUTATION,
    {
      refetchQueries: [{ query: GET_INCOMES_QUERY, variables: { projectId } }],
    },
  );
  const [updateIncome, { loading: updatingIncome }] = useMutation(
    UPDATE_INCOME_MUTATION,
    {
      refetchQueries: [{ query: GET_INCOMES_QUERY, variables: { projectId } }],
    },
  );
  const [deleteIncome] = useMutation(DELETE_INCOME_MUTATION, {
    refetchQueries: [{ query: GET_INCOMES_QUERY, variables: { projectId } }],
  });

  const isExpenseTab = tab === 0;
  const entries: Entry[] = isExpenseTab
    ? (expenseData?.expenses ?? [])
    : (incomeData?.incomes ?? []);
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const isMutating =
    creatingExpense || updatingExpense || creatingIncome || updatingIncome;

  const openAdd = () => {
    setMutationError(undefined);
    setDialog({ open: true, type: isExpenseTab ? "expense" : "income" });
  };

  const openEdit = (entry: Entry) => {
    setMutationError(undefined);
    setDialog({
      open: true,
      type: isExpenseTab ? "expense" : "income",
      entry,
    });
  };

  const handleSubmit = async (values: { name: string; amount: number }) => {
    if (!dialog.open) return;
    try {
      if (dialog.entry) {
        if (isExpenseTab) {
          await updateExpense({
            variables: { id: dialog.entry.id, ...values },
          });
        } else {
          await updateIncome({ variables: { id: dialog.entry.id, ...values } });
        }
        setDialog({ open: false });
        return;
      }
      if (isExpenseTab) {
        await createExpense({ variables: { projectId, ...values } });
      } else {
        await createIncome({ variables: { projectId, ...values } });
      }

      setDialog({ open: false });
    } catch (e: unknown) {
      setMutationError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const handleDelete = async (entry: Entry) => {
    if (isExpenseTab) {
      await deleteExpense({ variables: { id: entry.id } });
    } else {
      await deleteIncome({ variables: { id: entry.id } });
    }
  };

  const loading = expensesLoading || incomesLoading;
  const queryError = expensesError || incomesError;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            Finance
          </Typography>
          <Button color="inherit" startIcon={<AddIcon />} onClick={openAdd}>
            Add
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Expenses" />
          <Tab label="Incomes" />
        </Tabs>

        {loading && <CircularProgress />}
        {queryError && <Alert severity="error">{queryError.message}</Alert>}

        {!loading && entries.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" mt={6}>
            No {isExpenseTab ? "expenses" : "incomes"} yet.
          </Typography>
        ) : (
          <List>
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                secondaryAction={
                  canModify(entry) ? (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton size="small" onClick={() => openEdit(entry)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(entry)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : undefined
                }
              >
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        pr: 10,
                      }}
                    >
                      <span>{entry.name}</span>
                      <strong>${entry.amount.toFixed(2)}</strong>
                    </Box>
                  }
                  secondary={`${entry.user.name} · ${new Date(entry.createdAt).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
            <Divider />
            <ListItem>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pr: 10,
                    }}
                  >
                    <strong>Total</strong>
                    <strong>${total.toFixed(2)}</strong>
                  </Box>
                }
              />
            </ListItem>
          </List>
        )}
      </Container>

      {dialog.open && (
        <FinanceEntryDialog
          open
          type={dialog.type}
          initial={
            dialog.entry
              ? { name: dialog.entry.name, amount: dialog.entry.amount }
              : undefined
          }
          loading={isMutating}
          error={mutationError}
          onClose={() => setDialog({ open: false })}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
