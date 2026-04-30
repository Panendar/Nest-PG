import { Button, HStack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../state/AuthContext";

export function AuthEntryPage() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthShell
      title="Find Your Next PG"
      subtitle="Sign in or create an account to unlock full search, compare, and direct owner contact flows."
      footer={
        <Text color="gray.700" fontSize="sm">
          Secure access is required before entering the dashboard.
        </Text>
      }
    >
      <HStack spacing={3}>
        <Button as={RouterLink} to="/login" flex="1">
          Sign in
        </Button>
        <Button as={RouterLink} to="/register" flex="1" variant="outline">
          Register
        </Button>
      </HStack>
      {isAuthenticated ? (
        <HStack spacing={3} mt={4}>
          <Button flex="1" variant="ghost" onClick={() => navigate("/app/search", { replace: true })}>
            Continue to dashboard
          </Button>
          <Button flex="1" variant="ghost" onClick={logout}>
            Sign out first
          </Button>
        </HStack>
      ) : null}
    </AuthShell>
  );
}
