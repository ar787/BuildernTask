import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { CreateProjectDialog } from "../components/CreateProjectDialog";

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
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Projects
          </Typography>
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

      <CreateProjectDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={onCreate}
      />
    </>
  );
}
