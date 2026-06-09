import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
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
import { GET_PROJECTS_QUERY } from "../graphql/queries";
import { CREATE_PROJECT_MUTATION } from "../graphql/mutations";
import { useAuth } from "../hooks/useAuth";

const projectSchema = yup.object({
  name: yup.string().min(1).required("Name is required"),
  location: yup.string().min(1).required("Location is required"),
});

type ProjectFormValues = yup.InferType<typeof projectSchema>;

interface Project {
  id: number;
  name: string;
  location: string;
  ownerId: number;
  owner: { id: number; name: string };
  createdAt: string;
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const { data, loading, error } = useQuery(GET_PROJECTS_QUERY);

  const [createProject, { loading: creating, error: createError }] =
    useMutation(CREATE_PROJECT_MUTATION, {
      refetchQueries: [GET_PROJECTS_QUERY],
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({ resolver: yupResolver(projectSchema) });

  const handleCreate = async (values: ProjectFormValues) => {
    await createProject({ variables: values });
    reset();
    setOpen(false);
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
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
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
        {error && <Alert severity="error">{error.message}</Alert>}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          {data?.projects.map((project: Project) => (
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

        {data?.projects.length === 0 && !loading && (
          <Typography color="text.secondary" textAlign="center" mt={6}>
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
                {createError.message}
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
