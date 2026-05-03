import { Button, Card, CardBody, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export function OwnerListingsPage() {
  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between" align="center">
        <Heading size="lg">Your listings</Heading>
        <Button as={RouterLink} to="/owner/listings/new">
          New listing
        </Button>
      </HStack>

      <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
        <CardBody>
          <Text color="gray.700">
            Published and draft listing management is available under this workspace. Start by creating a listing, then edit
            details, availability, and media from the management view.
          </Text>
        </CardBody>
      </Card>
    </VStack>
  );
}
