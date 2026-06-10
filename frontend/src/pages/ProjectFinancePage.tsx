import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useAuth } from '../hooks/useAuth';
import { FinanceEntryDialog } from '../components/FinanceEntryDialog';
import { BudgetReportDialog } from '../components/BudgetReportDialog';

type Entry = {
  id: number;
  name: string;
  amount: number;
  userId: number;
  createdAt: string;
  user: { id: number; name: string };
};

type BudgetLine = {
  name: string;
  totalExpense: number;
  totalIncome: number;
  difference: number;
};

type DialogState = { open: false } | { open: true; type: 'expense' | 'income'; entry?: Entry };

type ProjectFinancePageProps = {
  projectId: number;
  ownerId: number | undefined;
  expenses: Entry[];
  incomes: Entry[];
  loading: boolean;
  error?: string;
  budgetReport: BudgetLine[];
  budgetLoading: boolean;
  budgetError?: string;
  onOpenBudget: () => void;
  onCreateExpense: (v: { name: string; amount: number }) => Promise<unknown>;
  onUpdateExpense: (id: number, v: { name?: string; amount?: number }) => Promise<unknown>;
  onDeleteExpense: (id: number) => Promise<unknown>;
  onCreateIncome: (v: { name: string; amount: number }) => Promise<unknown>;
  onUpdateIncome: (id: number, v: { name?: string; amount?: number }) => Promise<unknown>;
  onDeleteIncome: (id: number) => Promise<unknown>;
};

export function ProjectFinancePage({
  projectId,
  ownerId,
  expenses,
  incomes,
  loading,
  error,
  budgetReport,
  budgetLoading,
  budgetError,
  onOpenBudget,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  onCreateIncome,
  onUpdateIncome,
  onDeleteIncome,
}: Readonly<ProjectFinancePageProps>) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<0 | 1>(0);
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [mutationError, setMutationError] = useState<string | undefined>();
  const [mutating, setMutating] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const isExpenseTab = tab === 0;
  const entries: Entry[] = isExpenseTab ? expenses : incomes;
  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  const canModify = (entry: Entry) => user?.id === entry.userId || user?.id === ownerId;

  const openAdd = () => {
    setMutationError(undefined);
    setDialog({ open: true, type: isExpenseTab ? 'expense' : 'income' });
  };

  const openEdit = (entry: Entry) => {
    setMutationError(undefined);
    setDialog({ open: true, type: isExpenseTab ? 'expense' : 'income', entry });
  };

  const handleSubmit = async (values: { name: string; amount: number }) => {
    if (!dialog.open) return;
    setMutating(true);
    try {
      if (dialog.entry) {
        if (isExpenseTab) {
          await onUpdateExpense(dialog.entry.id, values);
        } else {
          await onUpdateIncome(dialog.entry.id, values);
        }
      } else if (isExpenseTab) {
        await onCreateExpense(values);
      } else {
        await onCreateIncome(values);
      }
      setDialog({ open: false });
    } catch (e: unknown) {
      setMutationError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (entry: Entry) => {
    if (isExpenseTab) {
      await onDeleteExpense(entry.id);
    } else {
      await onDeleteIncome(entry.id);
    }
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
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
          <Button
            color="inherit"
            startIcon={<AssessmentIcon />}
            onClick={() => {
              onOpenBudget();
              setBudgetOpen(true);
            }}
            sx={{ mr: 1 }}
          >
            Budget
          </Button>
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
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && entries.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 6 }}>
            No {isExpenseTab ? 'expenses' : 'incomes'} yet.
          </Typography>
        ) : (
          <List>
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                secondaryAction={
                  canModify(entry) ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => openEdit(entry)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(entry)}>
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
                        display: 'flex',
                        justifyContent: 'space-between',
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
                      display: 'flex',
                      justifyContent: 'space-between',
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

      <BudgetReportDialog
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        budgetReport={budgetReport}
        loading={budgetLoading}
        error={budgetError}
      />

      {dialog.open && (
        <FinanceEntryDialog
          open
          type={dialog.type}
          initial={
            dialog.entry ? { name: dialog.entry.name, amount: dialog.entry.amount } : undefined
          }
          loading={mutating}
          error={mutationError}
          onClose={() => setDialog({ open: false })}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
