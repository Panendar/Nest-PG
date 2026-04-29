import React from "react";
import { Alert, AlertIcon, Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // Centralized fallback; detailed telemetry can be added here later.
    console.error("Unhandled UI error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8}>
          <VStack align="start" spacing={4}>
            <Heading size="md">Something went wrong</Heading>
            <Alert status="error">
              <AlertIcon />
              Unexpected error occurred. Please try again.
            </Alert>
            <Text>If the issue persists, contact support.</Text>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
