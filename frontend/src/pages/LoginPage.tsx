import axios from "axios";
import { Alert, AlertIcon, Box, Button, Input, Link, Stack, Text } from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import { Link as RouterLink, Navigate, useLocation, useNavigate } from "react-router-dom";

import { loginWithCredentials, fetchCurrentUser } from "../api/auth";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../state/AuthContext";
import { getHomePathForUser } from "../utils/authRouting";

export function LoginPage() {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("change-me");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to={getHomePathForUser(user)} replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const tokenResponse = await loginWithCredentials({ email, password });
      const currentUser = await fetchCurrentUser(tokenResponse.access_token);
      login({ token: tokenResponse.access_token, user: currentUser });
      const fromState = location.state as { from?: string } | null;
      const fallbackPath = getHomePathForUser(currentUser);
      const nextPath = fromState?.from && fromState.from !== "/" && fromState.from !== "/login" ? fromState.from : fallbackPath;
      navigate(nextPath, { replace: true });
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message as string | undefined) ??
          (error.response?.data?.detail?.message as string | undefined)
        : undefined;
      setErrorMessage(apiMessage || (error instanceof Error ? error.message : "Unable to sign in right now."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue searching, comparing, and contacting owners."
      footer={
        <Text color="gray.600" fontSize="sm">
          New here?{" "}
          <Link as={RouterLink} to="/register" color="brand.700" fontWeight="semibold">
            Create an account
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
            <Text fontSize="sm" color="gray.600" mb={1}>
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
            <Text fontSize="sm" color="gray.600" mb={1}>
              Password
            </Text>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Box>
          <Button type="submit" isLoading={isSubmitting} size="lg">
            Sign in
          </Button>
        </Stack>
      </form>
    </AuthShell>
  );
}
