import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

import { GET_PROJECTS_QUERY } from "../graphql/queries";
import { CREATE_PROJECT_MUTATION } from "../graphql/mutations";

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
      <Container maxWidth="md" sx={{ mt: 4 }}>
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
              <CardContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.location}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Owner: {project.owner.name}
                </Typography>
              </CardContent>
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
