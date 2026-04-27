import axios from "axios";
import {
  Alert,
  AlertIcon,
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

import {
  deleteRecentSearch,
  getRecentSearches,
  getSearchContext,
  type RecentSearchItem,
} from "../api/recentSearches";
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

function restoreSearchUrl(basePath: string, item: RecentSearchItem): string {
  const params = new URLSearchParams();
  if (item.city) {
    params.set("mode", "city");
    params.set("city", item.city);
  }
  if (item.radius_km) {
    params.set("mode", "nearby");
    params.set("radius_km", String(item.radius_km));
    params.set("lat", "17.4425");
    params.set("lng", "78.3498");
    params.set("location_label", "Gachibowli, Hyderabad");
  }
  const filters = item.filters ?? {};
  if (typeof filters.availability === "string") {
    params.set("availability", filters.availability);
  }
  if (typeof filters.price_min === "number") {
    params.set("price_min", String(filters.price_min));
  }
  if (typeof filters.price_max === "number") {
    params.set("price_max", String(filters.price_max));
  }
  if (item.sort) {
    params.set("sort", item.sort);
  }
  params.set("restored", "1");
  return `${basePath}/search?${params.toString()}`;
}

function formatContext(item: RecentSearchItem): string {
  const parts: string[] = [];
  if (item.city) {
    parts.push(item.city);
  }
  if (item.radius_km) {
    parts.push(`${item.radius_km} km`);
  }
  const filters = item.filters ?? {};
  if (typeof filters.availability === "string") {
    parts.push(filters.availability);
  }
  if (typeof filters.price_min === "number" || typeof filters.price_max === "number") {
    parts.push(`Price: ${filters.price_min ?? "?"}-${filters.price_max ?? "?"}`);
  }
  return parts.join(" | ") || "Search context";
}

export function RecentSearchesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<RecentSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const basePath = useMemo(() => getModuleBasePath(location.pathname), [location.pathname]);
  const startSearchHref = readLastSearchContext(`${basePath}/search`);

  async function loadRecentSearches(): Promise<void> {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getRecentSearches();
      setItems(data.items);
    } catch (error) {
      setErrorMessage(getApiMessage(error, "Recent searches are temporarily unavailable. Please try again shortly."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecentSearches();
  }, []);

  async function handleRemove(item: RecentSearchItem): Promise<void> {
    setBusyId(item.id);
    try {
      await deleteRecentSearch(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      setErrorMessage(getApiMessage(error, "Could not remove this recent search right now."));
    } finally {
      setBusyId(null);
    }
  }

  async function openRecentSearch(item: RecentSearchItem): Promise<void> {
    setBusyId(item.id);
    try {
      const context = await getSearchContext(item.id);
      navigate(restoreSearchUrl(basePath, context));
    } catch (error) {
      setErrorMessage(getApiMessage(error, "We could not restore this search. Please try again."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="start" flexWrap="wrap">
        <Box>
          <Heading size="xl" letterSpacing="-0.03em">
            Recent searches
          </Heading>
          <Text color="gray.600" mt={2}>
            Reopen your recent city or nearby search contexts. These entries are tied to your signed-in account.
          </Text>
        </Box>
        <Button as={RouterLink} to={startSearchHref} variant="outline">
          Start new search
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
              <Heading size="md">You have no recent searches yet.</Heading>
              <Text color="gray.600">Start a search to see it here later.</Text>
              <Button as={RouterLink} to={startSearchHref} colorScheme="blue">
                Start new search
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
                  <Box>
                    <Heading size="md">{formatContext(item)}</Heading>
                    <Text color="gray.600" mt={1}>
                      Last used: {new Date(item.searched_at).toLocaleString()}
                    </Text>
                  </Box>
                  <HStack>
                    <Button
                      colorScheme="blue"
                      isLoading={busyId === item.id}
                      onClick={() => {
                        void openRecentSearch(item);
                      }}
                    >
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      isLoading={busyId === item.id}
                      onClick={() => {
                        void handleRemove(item);
                      }}
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
