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
import { Link as RouterLink, useLocation, useParams, useSearchParams } from "react-router-dom";

import { getListing, type ListingDetail } from "../api/listings";
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
  return pathname.replace(/\/listings\/[^/]+$/, "").replace(/\/listings$/, "");
}

export function ListingDetailsPage() {
  const { listingId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const basePath = useMemo(() => buildBasePath(location.pathname), [location.pathname]);
  const returnTo = searchParams.get("returnTo") || `${basePath}/search`;
  const compareHref = `${basePath}/compare?listing_ids=${encodeURIComponent(listingId ?? "")}&returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!listingId) {
      setErrorMessage("We could not identify this listing. Please open it again from search results.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setErrorMessage(null);

    void (async () => {
      try {
        const detail = await getListing(listingId);
        if (active) {
          setListing(detail);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            getApiMessage(error, "Something went wrong while loading this listing. Please try again.")
          );
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
  }, [listingId]);

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="start" flexWrap="wrap">
        <Box>
          <Heading size="xl" letterSpacing="-0.03em">
            Listing details
          </Heading>
          <Text color="gray.600" mt={2}>
            Review the listing before returning to results, comparing, or taking the next step.
          </Text>
        </Box>
        <HStack>
          <Button as={RouterLink} to={returnTo} variant="outline">
            Back to results
          </Button>
          <Button as={RouterLink} to={compareHref} colorScheme="purple">
            Compare this listing
          </Button>
        </HStack>
      </HStack>

      {errorMessage ? (
        <Alert status="error" rounded="xl">
          <AlertIcon />
          {errorMessage}
        </Alert>
      ) : null}

      {loading ? (
        <Card borderRadius="2xl" borderWidth="1px">
          <CardBody>
            <Skeleton height="32px" mb={4} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="20px" mb={2} />
          </CardBody>
        </Card>
      ) : listing ? (
        <Grid templateColumns={{ base: "1fr", lg: "1.25fr 0.75fr" }} gap={6}>
          <Card borderRadius="2xl" borderWidth="1px" boxShadow="0 18px 44px rgba(15,23,42,0.06)">
            <CardBody>
              <VStack align="stretch" spacing={5}>
                <Box>
                  <HStack spacing={2} mb={3} flexWrap="wrap">
                    <Badge colorScheme="blue">{listing.city}</Badge>
                    <Badge colorScheme={listing.accepting_inquiries ? "green" : "gray"}>
                      {listing.accepting_inquiries ? "Accepting inquiries" : "Not accepting inquiries"}
                    </Badge>
                    <Badge colorScheme={listing.availability_status === "available" ? "green" : listing.availability_status === "limited" ? "orange" : "gray"}>
                      {listing.availability_status}
                    </Badge>
                    {formatDistance(listing.distance_km) ? <Badge colorScheme="purple">{formatDistance(listing.distance_km)}</Badge> : null}
                  </HStack>
                  <Heading size="lg">{listing.title}</Heading>
                  <Text color="gray.600" mt={3}>
                    {listing.description}
                  </Text>
                </Box>

                {!listing.accepting_inquiries ? (
                  <Alert status="warning" rounded="xl">
                    <AlertIcon />
                    This listing is currently not accepting inquiries. You can still review it and continue browsing other options.
                  </Alert>
                ) : null}

                <Divider />

                <SimpleDetailRow label="Price" value={`${formatPrice(listing.price)} / month`} />
                <SimpleDetailRow label="Beds available" value={String(listing.beds_available)} />
                <SimpleDetailRow label="Wi-Fi" value={listing.wifi_included ? "Included" : "Not included"} />
                <SimpleDetailRow label="Meals" value={listing.meals_included ? "Included" : "Not included"} />
                <SimpleDetailRow label="Furnished" value={listing.furnished ? "Yes" : "No"} />
                <SimpleDetailRow label="Coordinates" value={`${listing.lat.toFixed(4)}, ${listing.lng.toFixed(4)}`} />
              </VStack>
            </CardBody>
          </Card>

          <Stack spacing={6}>
            <Card borderRadius="2xl" borderWidth="1px">
              <CardBody>
                <Heading size="md" mb={3}>
                  Owner details
                </Heading>
                <Stack spacing={2}>
                  <Text fontWeight="medium">{listing.owner.email}</Text>
                  <Text color="gray.600">Role: {listing.owner.role}</Text>
                  <Text color="gray.600">Owner ID: {listing.owner.id}</Text>
                </Stack>
              </CardBody>
            </Card>

            <Card borderRadius="2xl" borderWidth="1px">
              <CardBody>
                <Heading size="md" mb={3}>
                  Next actions
                </Heading>
                <VStack align="stretch" spacing={3}>
                  <Button as={RouterLink} to={compareHref} colorScheme="purple">
                    Compare with search selection
                  </Button>
                  <Button as={RouterLink} to={returnTo} variant="outline">
                    Back to results
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      ) : null}
    </VStack>
  );
}

function SimpleDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack justify="space-between" align="start" py={2}>
      <Text color="gray.500">{label}</Text>
      <Text fontWeight="medium" textAlign="right">
        {value}
      </Text>
    </HStack>
  );
}
