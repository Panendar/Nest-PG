import axios from "axios";
import { Alert, AlertIcon, Box, Button, Input, Link, Stack, Text } from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";

import { fetchCurrentUser, loginWithCredentials, registerWithCredentials } from "../api/auth";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../state/AuthContext";
import { getHomePathForUser } from "../utils/authRouting";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to={getHomePathForUser(user)} replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerWithCredentials({ email, password });
      const tokenResponse = await loginWithCredentials({ email, password });
      const currentUser = await fetchCurrentUser(tokenResponse.access_token);
      login({ token: tokenResponse.access_token, user: currentUser });
      navigate("/app/search", { replace: true });
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message as string | undefined) ??
          (error.response?.data?.detail?.message as string | undefined)
        : undefined;
      setErrorMessage(apiMessage || (error instanceof Error ? error.message : "Unable to create account right now."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle="Get access to full listing details, compare options, and contact owners directly."
      footer={
        <Text color="gray.700" fontSize="sm">
          Already have an account?{" "}
          <Link as={RouterLink} to="/login" color="brand.700" fontWeight="semibold">
            Sign in
          </Link>
        </Text>
      }
    >
      {errorMessage ? (
        <Alert status="error" mb={4} rounded="md">
          <AlertIcon />
          {errorMessage}
        </Alert>
      ) : null}
      <form onSubmit={onSubmit}>
        <Stack spacing={4}>
          <Box>
            <Text fontSize="sm" color="gray.700" mb={1} fontWeight="semibold">
              Email
            </Text>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.700" mb={1} fontWeight="semibold">
              Password
            </Text>
            <Input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.700" mb={1} fontWeight="semibold">
              Confirm password
            </Text>
            <Input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </Box>
          <Button type="submit" isLoading={isSubmitting} size="lg">
            Create account
          </Button>
        </Stack>
      </form>
    </AuthShell>
  );
}
