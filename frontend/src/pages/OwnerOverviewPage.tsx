import { Box, Card, CardBody, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";

export function OwnerOverviewPage() {
  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>
          Owner foundation ready
        </Heading>
        <Text color="gray.700">
          This workspace establishes the shared owner layout, navigation, auth guard, API client, and error handling that
          feature tranches will build on.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
          <CardBody>
            <Heading size="md" mb={2}>
              Next feature attachment point
            </Heading>
            <Text color="gray.700">
              Create and edit listing flows should attach under the listings route group in this workspace.
            </Text>
          </CardBody>
        </Card>

        <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
          <CardBody>
            <Heading size="md" mb={2}>
              Shared guarantees
            </Heading>
            <Text color="gray.700">
              Owner-only auth checks, API error handling, and sidebar navigation are already established for downstream
              feature work.
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
}
