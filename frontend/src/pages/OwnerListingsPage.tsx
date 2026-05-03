import { Alert, AlertIcon, Badge, Button, Card, CardBody, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { getApiErrorMessage } from "../api/client";
import { listOwnerListings, type OwnerListingSummary } from "../api/ownerListings";

export function OwnerListingsPage() {
  const [items, setItems] = useState<OwnerListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const response = await listOwnerListings({ page: 1, page_size: 50 });
        setItems(response.items);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "We could not load your listings right now."));
      } finally {
        setLoading(false);
      }
    }
    void run();
  }, []);

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between" align="center">
        <Heading size="lg">Your listings</Heading>
        <Button as={RouterLink} to="/owner/listings/new">
          New listing
        </Button>
      </HStack>

      {error ? (
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          {error}
        </Alert>
      ) : null}

      {loading ? <Text color="gray.600">Loading listings...</Text> : null}

      {!loading && items.length === 0 ? (
        <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
          <CardBody>
            <Text color="gray.700" mb={2}>
              You do not have any listings to manage yet.
            </Text>
            <Text color="gray.600">Create your first listing to start managing details, media, and availability.</Text>
          </CardBody>
        </Card>
      ) : null}

      {items.map((item) => (
        <Card key={item.id} borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Heading size="sm">{item.pg_name}</Heading>
                <HStack>
                  <Badge>{item.listing_status}</Badge>
                  <Badge colorScheme={item.availability_status === "available" ? "green" : item.availability_status === "limited" ? "yellow" : "red"}>
                    {item.availability_status}
                  </Badge>
                </HStack>
              </HStack>
              <Text color="gray.700">
                {item.area}, {item.city} · Rs {item.monthly_rent}/month
              </Text>
              <HStack>
                <Button as={RouterLink} to={`/owner/listings/${item.id}`} size="sm">
                  Open listing
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
}
