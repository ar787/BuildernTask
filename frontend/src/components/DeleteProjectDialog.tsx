import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type DeleteProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  projectName: string;
  onDelete: () => Promise<void>;
};

export function DeleteProjectDialog({
  open,
  onClose,
  projectName,
  onDelete,
}: Readonly<DeleteProjectDialogProps>) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
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
        <Button color="error" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
