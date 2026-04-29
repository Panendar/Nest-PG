import { Heading, Text, VStack } from "@chakra-ui/react";

export function NotFoundPage() {
  return (
    <VStack align="start" spacing={2} p={8}>
      <Heading size="md">Page not found</Heading>
      <Text color="gray.600">Check the URL or return to the app home.</Text>
    </VStack>
  );
}
