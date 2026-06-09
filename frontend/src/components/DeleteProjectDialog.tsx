import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DELETE_PROJECT_MUTATION } from "../graphql/mutations";
import { GET_PROJECTS_QUERY } from "../graphql/queries";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
}

export function DeleteProjectDialog({
  open,
  onClose,
  projectId,
  projectName,
}: Props) {
  const navigate = useNavigate();

  const [deleteProject, { loading }] = useMutation(DELETE_PROJECT_MUTATION, {
    refetchQueries: [GET_PROJECTS_QUERY],
    onCompleted: () => navigate("/projects"),
  });

  const handleDelete = async () => {
    await deleteProject({ variables: { id: projectId } });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete "{projectName}"? This cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
