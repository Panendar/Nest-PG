import { Button, Card, CardBody, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";

export function OwnerListingManagementPage() {
  const { listingId } = useParams();

  return (
    <VStack align="stretch" spacing={5}>
      <Heading size="lg">Listing management</Heading>
      <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
        <CardBody>
          <Text mb={4} color="gray.700">
            Listing ID: {listingId}
          </Text>
          <HStack spacing={3}>
            <Button as={RouterLink} to={`/owner/listings/${listingId}/edit`} variant="outline">
              Edit details
            </Button>
            <Button as={RouterLink} to={`/owner/listings/${listingId}/availability`} variant="outline">
              Update availability
            </Button>
            <Button as={RouterLink} to={`/owner/listings/${listingId}/media`} variant="outline">
              Manage media
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
