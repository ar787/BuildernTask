import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { REGISTER_MUTATION } from "../graphql/mutations";
import { useAuth } from "../hooks/useAuth";

const schema = yup.object({
  name: yup.string().min(2, "Min 2 characters").required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Min 6 characters")
    .required("Password is required"),
});

type FormValues = yup.InferType<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const [registerMutation, { loading, error }] = useMutation(REGISTER_MUTATION);

  const onSubmit = async (values: FormValues) => {
    const result = await registerMutation({ variables: values });
    const data = result.data as { register: { token: string; user: { id: number; name: string; email: string } } };
    login(data.register.token, data.register.user);
    navigate("/projects");
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
            Create account
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Register"}
            </Button>
            <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "inherit" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
