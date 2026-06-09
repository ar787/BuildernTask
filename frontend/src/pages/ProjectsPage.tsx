import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import MailIcon from "@mui/icons-material/Mail";
import { useAuth } from "../hooks/useAuth";

const projectSchema = yup.object({
  name: yup.string().min(1).required("Name is required"),
  location: yup.string().min(1).required("Location is required"),
});

type ProjectFormValues = yup.InferType<typeof projectSchema>;

type Project = {
  id: number;
  name: string;
  location: string;
  ownerId: number;
  owner: { id: number; name: string };
  createdAt: string;
};

type ProjectsPageProps = {
  projects: Project[];
  loading: boolean;
  error?: string;
  onCreate: (values: { name: string; location: string }) => Promise<void>;
};

export function ProjectsPage({
  projects,
  loading,
  error,
  onCreate,
}: Readonly<ProjectsPageProps>) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({ resolver: yupResolver(projectSchema) });

  const handleCreate = async (values: ProjectFormValues) => {
    setCreateError(undefined);
    setCreating(true);
    try {
      await onCreate(values);
      reset();
      setOpen(false);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Projects
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={() => navigate("/invitations")}>
            <MailIcon />
          </IconButton>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            New Project
          </Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          {projects.map((project) => (
            <Card key={project.id}>
              <CardActionArea
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.location}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Owner: {project.owner.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>

        {projects.length === 0 && !loading && (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", mt: 6 }}
          >
            No projects yet. Create your first one!
          </Typography>
        )}
      </Container>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>New Project</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handleCreate)}>
          <DialogContent>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError}
              </Alert>
            )}
            <TextField
              label="Name"
              fullWidth
              margin="dense"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Location"
              fullWidth
              margin="dense"
              {...register("location")}
              error={!!errors.location}
              helperText={errors.location?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
