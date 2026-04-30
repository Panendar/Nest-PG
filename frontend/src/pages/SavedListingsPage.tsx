import axios from "axios";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { deleteSavedListing, getSavedListings, type SavedListingItem } from "../api/savedListings";
import { formatPrice } from "../components/ListingCards";
import { getModuleBasePath, readLastSearchContext } from "../utils/navigation";

function getApiMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.error?.message;
    if (typeof responseMessage === "string" && responseMessage.length > 0) {
      return responseMessage;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function SavedListingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<SavedListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const basePath = useMemo(() => getModuleBasePath(location.pathname), [location.pathname]);
  const continueBrowsingHref = readLastSearchContext(`${basePath}/search`);

  async function loadSavedListings(): Promise<void> {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getSavedListings();
      setItems(data.items);
    } catch (error) {
      setErrorMessage(getApiMessage(error, "Saved listings are temporarily unavailable. Please try again shortly."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSavedListings();
  }, []);

  async function handleRemove(item: SavedListingItem): Promise<void> {
    setBusyId(item.id);
    try {
      await deleteSavedListing(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      setErrorMessage(getApiMessage(error, "Could not remove this saved listing right now."));
    } finally {
      setBusyId(null);
    }
  }

  function openListing(item: SavedListingItem): void {
    const returnTo = `${basePath}/saved`;
    navigate(`${basePath}/listings/${item.listing_id}?returnTo=${encodeURIComponent(returnTo)}&fromSaved=1&savedListingId=${item.id}`);
  }

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="start" flexWrap="wrap">
        <Box>
          <Heading size="xl" letterSpacing="-0.03em">
            Saved listings
          </Heading>
          <Text color="gray.700" mt={2}>
            Revisit PG options you marked for later comparison.
          </Text>
        </Box>
        <Button as={RouterLink} to={continueBrowsingHref} variant="outline">
          Continue browsing
        </Button>
      </HStack>

      {errorMessage ? (
        <Alert status="error" rounded="xl">
          <AlertIcon />
          {errorMessage}
        </Alert>
      ) : null}

      {loading ? (
        <Stack spacing={4}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} borderRadius="2xl" borderWidth="1px">
              <CardBody>
                <Skeleton height="24px" mb={3} />
                <Skeleton height="18px" mb={2} />
                <Skeleton height="18px" />
              </CardBody>
            </Card>
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <Card borderRadius="2xl" borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={3}>
              <Heading size="md">You have no saved listings yet.</Heading>
              <Text color="gray.700">Save PGs from search or details to revisit later.</Text>
              <Button as={RouterLink} to={continueBrowsingHref}>
                Continue browsing
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Stack spacing={4}>
          {items.map((item) => (
            <Card key={item.id} borderRadius="2xl" borderWidth="1px">
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between" align="start" flexWrap="wrap">
                    <Box>
                      <Heading size="md">{item.listing_summary.title}</Heading>
                      <Text color="gray.700" mt={1}>
                        {formatPrice(item.listing_summary.price)} / month
                      </Text>
                    </Box>
                    <HStack>
                      <Badge colorScheme={item.listing_summary.accepting_inquiries ? "green" : "gray"}>
                        {item.listing_summary.accepting_inquiries ? "Active" : "Unavailable"}
                      </Badge>
                      <Badge colorScheme="brand">Saved</Badge>
                    </HStack>
                  </HStack>
                  <Text color="gray.700">{item.listing_summary.city}</Text>
                  {!item.listing_summary.accepting_inquiries ? (
                    <Alert status="warning" rounded="xl">
                      <AlertIcon />
                      This saved listing may need a fresh availability check before you contact the owner.
                    </Alert>
                  ) : null}
                  <HStack>
                    <Button onClick={() => openListing(item)}>
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        void handleRemove(item);
                      }}
                      isLoading={busyId === item.id}
                    >
                      Remove
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      )}
    </VStack>
  );
}
