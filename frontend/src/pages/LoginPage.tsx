import { Alert, AlertIcon, Box, Button, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginWithCredentials, fetchCurrentUser } from "../api/auth";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("change-me");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const tokenResponse = await loginWithCredentials({ email, password });
      const currentUser = await fetchCurrentUser(tokenResponse.access_token);
      login({ token: tokenResponse.access_token, user: currentUser });
      navigate("/app/search", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box maxW="480px" mx="auto" mt={16} p={8} borderWidth="1px" rounded="2xl" bg="white" boxShadow="lg">
      <Heading size="lg" mb={2}>
        Sign in to My_PG
      </Heading>
      <Text color="gray.600" mb={6}>
        Use the seeded user account to open discovery, detail, and compare flows.
      </Text>
      {errorMessage ? (
        <Alert status="error" mb={4} rounded="md">
          <AlertIcon />
          {errorMessage}
        </Alert>
      ) : null}
      <form onSubmit={onSubmit}>
        <Stack spacing={4}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            Continue
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
