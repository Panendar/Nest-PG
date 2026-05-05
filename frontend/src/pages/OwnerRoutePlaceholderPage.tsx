import { Box, Card, CardBody, Heading, Text } from "@chakra-ui/react";

type OwnerRoutePlaceholderPageProps = {
  title: string;
  description: string;
};

export function OwnerRoutePlaceholderPage({ title, description }: OwnerRoutePlaceholderPageProps) {
  return (
    <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
      <CardBody>
        <Heading size="md" mb={3}>
          {title}
        </Heading>
        <Text color="gray.700">{description}</Text>
        <Box mt={4} rounded="xl" bg="gray.50" borderWidth="1px" borderColor="gray.200" px={4} py={3}>
          <Text fontSize="sm" color="gray.600">
            Foundation only: feature-specific UI will be added in subsequent tranches.
          </Text>
        </Box>
      </CardBody>
    </Card>
  );
}
