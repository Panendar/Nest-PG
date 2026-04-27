import axios from "axios";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Grid,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useSearchParams } from "react-router-dom";

import { compareListings, type CompareListing } from "../api/listings";
import { formatDistance, formatPrice } from "../components/ListingCards";

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

function buildBasePath(pathname: string): string {
  return pathname.replace(/\/compare$/, "").replace(/\/listings\/[^/]+$/, "").replace(/\/listings$/, "");
}

function extractListingIds(searchParams: URLSearchParams): string[] {
  const rawValue = searchParams.get("listing_ids") ?? searchParams.get("ids") ?? "";
  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function createReturnOnlyParams(returnTo: string): URLSearchParams {
  const nextParams = new URLSearchParams();
  nextParams.set("returnTo", returnTo);
  return nextParams;
}

export function CompareListingsPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<CompareListing[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const basePath = useMemo(() => buildBasePath(location.pathname), [location.pathname]);
  const returnTo = searchParams.get("returnTo") || `${basePath}/search`;
  const listingIds = extractListingIds(searchParams);
  const showMinimumSelectionPrompt = listingIds.length < 2;

  useEffect(() => {
    if (showMinimumSelectionPrompt) {
      setItems(null);
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    let active = true;
    setLoading(true);
    setErrorMessage(null);

    void (async () => {
      try {
        const response = await compareListings(listingIds);
        if (active) {
          setItems(response.items);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            getApiMessage(error, "Something went wrong while loading comparison. Please try again.")
          );
          setItems(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [listingIds.join(","), showMinimumSelectionPrompt]);

  function removeListing(listingId: string): void {
    const nextIds = listingIds.filter((item) => item !== listingId);
    if (nextIds.length < 2) {
      setSearchParams(createReturnOnlyParams(returnTo));
      return;
    }

    const nextParams = new URLSearchParams();
    nextParams.set("listing_ids", nextIds.join(","));
    nextParams.set("returnTo", returnTo);
    setSearchParams(nextParams);
  }

  const fieldOrder = [
    { label: "Price", render: (listing: CompareListing) => formatPrice(listing.price) },
    { label: "Distance", render: (listing: CompareListing) => formatDistance(listing.distance_km) ?? "—" },
    { label: "Availability", render: (listing: CompareListing) => listing.availability_status },
    { label: "Beds", render: (listing: CompareListing) => String(listing.beds_available) },
    { label: "Wi-Fi", render: (listing: CompareListing) => (listing.wifi_included ? "Yes" : "No") },
    { label: "Meals", render: (listing: CompareListing) => (listing.meals_included ? "Yes" : "No") },
    { label: "Furnished", render: (listing: CompareListing) => (listing.furnished ? "Yes" : "No") },
    {
      label: "Amenities",
      render: (listing: CompareListing) => (listing.amenities.length > 0 ? listing.amenities.join(", ") : "—"),
    },
  ];

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="start" flexWrap="wrap">
        <Box>
          <Heading size="xl" letterSpacing="-0.03em">
            Compare listings
          </Heading>
          <Text color="gray.600" mt={2}>
            Review a consistent field order across listings, then remove or open one without losing your search context.
          </Text>
        </Box>
        <Button as={RouterLink} to={returnTo} variant="outline">
          Back to results
        </Button>
      </HStack>

      {showMinimumSelectionPrompt ? (
        <Card borderRadius="2xl" borderWidth="1px">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Alert status="warning" rounded="xl">
                <AlertIcon />
                Select one more listing to compare. You can compare up to 4 listings at a time.
              </Alert>
              <HStack>
                <Button as={RouterLink} to={returnTo} colorScheme="blue" alignSelf="start">
                  Continue browsing
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchParams(createReturnOnlyParams(returnTo));
                  }}
                >
                  Clear selection
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ) : null}

      {errorMessage ? (
        <Alert status="error" rounded="xl">
          <AlertIcon />
          {errorMessage}
        </Alert>
      ) : null}

      {loading ? (
        <Grid templateColumns={{ base: "1fr", xl: "repeat(3, 1fr)" }} gap={4}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} borderRadius="2xl" borderWidth="1px">
              <CardBody>
                <Skeleton height="28px" mb={3} />
                <Skeleton height="20px" mb={2} />
                <Skeleton height="20px" mb={2} />
                <Skeleton height="20px" mb={2} />
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : items && items.length >= 2 ? (
        <Grid templateColumns={{ base: "1fr", xl: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))` }} gap={4}>
          {items.map((listing) => (
            <Card key={listing.id} borderRadius="2xl" borderWidth="1px" boxShadow="0 18px 44px rgba(15,23,42,0.06)">
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <HStack spacing={2} mb={2} flexWrap="wrap">
                      <Badge colorScheme="blue">{listing.city}</Badge>
                      <Badge colorScheme={listing.accepting_inquiries ? "green" : "gray"}>
                        {listing.accepting_inquiries ? "Accepting inquiries" : "Not accepting inquiries"}
                      </Badge>
                    </HStack>
                    <Heading size="md">{listing.title}</Heading>
                  </Box>

                  <Divider />

                  <Stack spacing={2}>
                    {fieldOrder.map((field) => (
                      <HStack key={field.label} justify="space-between" align="start">
                        <Text color="gray.500">{field.label}</Text>
                        <Text fontWeight="medium" textAlign="right">
                          {field.render(listing)}
                        </Text>
                      </HStack>
                    ))}
                  </Stack>

                  <Divider />

                  <VStack align="stretch" spacing={2}>
                    <Button as={RouterLink} to={`${basePath}/listings/${listing.id}?returnTo=${encodeURIComponent(returnTo)}`} colorScheme="purple">
                      View details
                    </Button>
                    <Button variant="outline" onClick={() => removeListing(listing.id)}>
                      Remove
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : null}
    </VStack>
  );
}
