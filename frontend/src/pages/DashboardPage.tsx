import axios from "axios";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { searchListings, searchNearbyListings, type SearchResults } from "../api/listings";
import { ListingSummaryCard } from "../components/ListingCards";

type NearbyLocation = {
  label: string;
  lat: number;
  lng: number;
};

const recentCities = ["Hyderabad", "Bengaluru", "Pune"];
const radiusOptions = [1, 2, 5, 10, 15, 20];
const defaultLocation: NearbyLocation = {
  label: "Gachibowli, Hyderabad",
  lat: 17.4425,
  lng: 78.3498,
};

const citySortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_low_to_high" },
  { label: "Price: High to Low", value: "price_high_to_low" },
  { label: "Newest", value: "newest" },
];

const nearbySortOptions = [
  { label: "Nearest", value: "nearest" },
  { label: "Price: Low to High", value: "price_low_to_high" },
  { label: "Price: High to Low", value: "price_high_to_low" },
  { label: "Newest", value: "newest" },
];

function readOptionalNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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

function buildReturnTo(locationPathname: string, locationSearch: string): string {
  return `${locationPathname}${locationSearch}`;
}

function buildBasePath(pathname: string): string {
  return pathname.replace(/\/search$/, "");
}

function parseLocation(searchParams: URLSearchParams): NearbyLocation | null {
  const lat = readOptionalNumber(searchParams.get("lat"));
  const lng = readOptionalNumber(searchParams.get("lng"));
  const label = searchParams.get("location_label");

  if (lat === null || lng === null || !label) {
    return null;
  }

  return { label, lat, lng };
}

function buildSearchSummary(results: SearchResults | null, loading: boolean, hasSearch: boolean): string {
  if (loading) {
    return "Loading results";
  }
  if (!hasSearch) {
    return "Start a search to see PG listings";
  }
  if (!results) {
    return "No results yet";
  }
  return `${results.pagination.total} listings found`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = searchParams.toString();
  const basePath = useMemo(() => buildBasePath(location.pathname), [location.pathname]);
  const hasSearch = Boolean(searchParams.get("city") || searchParams.get("mode") === "nearby");

  const [cityInput, setCityInput] = useState(searchParams.get("city") ?? "");
  const [radiusInput, setRadiusInput] = useState(searchParams.get("radius_km") ?? "5");
  const [locationContext, setLocationContext] = useState<NearbyLocation | null>(parseLocation(searchParams) ?? defaultLocation);
  const [availabilityInput, setAvailabilityInput] = useState(searchParams.get("availability") ?? "");
  const [priceMinInput, setPriceMinInput] = useState(searchParams.get("price_min") ?? "");
  const [priceMaxInput, setPriceMaxInput] = useState(searchParams.get("price_max") ?? "");
  const [sortInput, setSortInput] = useState(searchParams.get("sort") ?? "relevance");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [compareMessage, setCompareMessage] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setCityInput(searchParams.get("city") ?? "");
    setRadiusInput(searchParams.get("radius_km") ?? "5");
    setLocationContext(parseLocation(searchParams) ?? defaultLocation);
    setAvailabilityInput(searchParams.get("availability") ?? "");
    setPriceMinInput(searchParams.get("price_min") ?? "");
    setPriceMaxInput(searchParams.get("price_max") ?? "");
    setSortInput(searchParams.get("sort") ?? (searchParams.get("mode") === "nearby" ? "nearest" : "relevance"));
  }, [searchKey]);

  useEffect(() => {
    if (!hasSearch) {
      setResults(null);
      setErrorMessage(null);
      setLoading(false);
      return;
    }

    const isNearby = searchParams.get("mode") === "nearby";
    const nearbyLocation = parseLocation(searchParams) ?? locationContext ?? defaultLocation;
    const currentPage = readOptionalNumber(searchParams.get("page")) ?? 1;
    const pageSize = readOptionalNumber(searchParams.get("page_size")) ?? 20;
    const city = searchParams.get("city") ?? "";
    const availability = searchParams.get("availability") || undefined;
    const priceMin = readOptionalNumber(searchParams.get("price_min"));
    const priceMax = readOptionalNumber(searchParams.get("price_max"));
    const sortValue = searchParams.get("sort") ?? (isNearby ? "nearest" : "relevance");
    const radiusKm = readOptionalNumber(searchParams.get("radius_km"));

    if (isNearby && (!locationContext || radiusKm === null)) {
      setResults(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setErrorMessage(null);

    void (async () => {
      try {
        const nextResults = isNearby
          ? await searchNearbyListings({
              lat: nearbyLocation.lat,
              lng: nearbyLocation.lng,
              radiusKm: radiusKm ?? Number(radiusInput),
              availability,
              priceMin,
              priceMax,
              sort: sortValue,
              page: currentPage,
              pageSize,
            })
          : await searchListings({
              city,
              availability,
              priceMin,
              priceMax,
              sort: sortValue,
              page: currentPage,
              pageSize,
            });

        if (requestIdRef.current !== requestId) {
          return;
        }

        setResults(nextResults);
        setSelectedIds((currentSelection) =>
          currentSelection.filter((listingId) => nextResults.items.some((item) => item.id === listingId))
        );
      } catch (error) {
        if (requestIdRef.current === requestId) {
          setErrorMessage(
            getApiMessage(
              error,
              isNearby ? "Nearby search is temporarily unavailable. Please try again shortly." : "Search is temporarily unavailable. Please try again shortly."
            )
          );
          setResults(null);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    })();
  }, [hasSearch, radiusInput, searchKey, searchParams]);

  const activeMode = searchParams.get("mode") === "nearby" ? "nearby" : "city";
  const activeSortOptions = activeMode === "nearby" ? nearbySortOptions : citySortOptions;
  const activeReturnTo = buildReturnTo(location.pathname, location.search);
  const resultCountLabel = buildSearchSummary(results, loading, hasSearch);

  function updateSearchParams(nextParams: URLSearchParams): void {
    setSearchParams(nextParams, { replace: false });
  }

  function handleCitySubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalizedCity = cityInput.trim().replace(/\s+/g, " ");
    const normalizedSort = citySortOptions.some((option) => option.value === sortInput) ? sortInput : "relevance";

    if (!normalizedCity) {
      setValidationMessage("Please enter a city to search.");
      return;
    }
    if (normalizedCity.length < 2) {
      setValidationMessage("Enter at least 2 characters for the city.");
      return;
    }
    if (normalizedCity.length > 100) {
      setValidationMessage("City name must be 100 characters or fewer.");
      return;
    }
    if (!/^[A-Za-z .-]+$/.test(normalizedCity)) {
      setValidationMessage("We could not run this search. Check the city name and try again.");
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("city", normalizedCity);
    nextParams.set("page", "1");
    nextParams.set("mode", "city");
    nextParams.set("sort", normalizedSort);
    nextParams.delete("lat");
    nextParams.delete("lng");
    nextParams.delete("radius_km");
    nextParams.delete("location_label");
    updateSearchParams(nextParams);
    setValidationMessage(null);
    setLocationMessage(null);
  }

  function handleNearbySubmit(): void {
    setLocationMessage(null);
    if (!locationContext) {
      setLocationMessage("We need your location to show nearby PGs.");
      return;
    }

    const radiusValue = Number(radiusInput);
    if (!radiusInput) {
      setLocationMessage("Please select a search radius.");
      return;
    }
    if (![1, 2, 5, 10, 15, 20].includes(radiusValue)) {
      setLocationMessage("Please choose one of the available radius options.");
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("city");
    nextParams.set("mode", "nearby");
    nextParams.set("lat", String(locationContext.lat));
    nextParams.set("lng", String(locationContext.lng));
    nextParams.set("location_label", locationContext.label);
    nextParams.set("radius_km", String(radiusValue));
    nextParams.set("page", "1");
    if (!nextParams.get("sort") || nextParams.get("sort") === "relevance") {
      nextParams.set("sort", "nearest");
    }
    updateSearchParams(nextParams);
  }

  function applyFilters(): void {
    const nextParams = new URLSearchParams(searchParams);
    const normalizedSort = activeSortOptions.some((option) => option.value === sortInput)
      ? sortInput
      : activeMode === "nearby"
        ? "nearest"
        : "relevance";
    if (availabilityInput) {
      nextParams.set("availability", availabilityInput);
    } else {
      nextParams.delete("availability");
    }
    if (priceMinInput) {
      nextParams.set("price_min", priceMinInput);
    } else {
      nextParams.delete("price_min");
    }
    if (priceMaxInput) {
      nextParams.set("price_max", priceMaxInput);
    } else {
      nextParams.delete("price_max");
    }
    nextParams.set("sort", normalizedSort);
    nextParams.set("page", "1");
    updateSearchParams(nextParams);
  }

  function resetFilters(): void {
    setAvailabilityInput("");
    setPriceMinInput("");
    setPriceMaxInput("");
    setSortInput(activeMode === "nearby" ? "nearest" : "relevance");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("availability");
    nextParams.delete("price_min");
    nextParams.delete("price_max");
    nextParams.delete("sort");
    nextParams.set("page", "1");
    updateSearchParams(nextParams);
  }

  function updatePage(page: number): void {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(page));
    updateSearchParams(nextParams);
  }

  function toggleCompare(listingId: string): void {
    setCompareMessage(null);
    setSelectedIds((current) => {
      if (current.includes(listingId)) {
        return current.filter((item) => item !== listingId);
      }
      if (current.length >= 4) {
        setCompareMessage("You can compare up to 4 listings at a time.");
        return current;
      }
      return [...current, listingId];
    });
  }

  function openCompare(): void {
    if (selectedIds.length < 2) {
      setCompareMessage("Select at least two listings to start comparing.");
      return;
    }

    const compareParams = new URLSearchParams();
    compareParams.set("listing_ids", selectedIds.join(","));
    compareParams.set("returnTo", activeReturnTo);
    navigate(`${basePath}/compare?${compareParams.toString()}`);
  }

  const activeFilterChips = [
    availabilityInput ? { label: `Availability: ${availabilityInput}`, key: "availability" } : null,
    priceMinInput ? { label: `Min: Rs ${priceMinInput}`, key: "price_min" } : null,
    priceMaxInput ? { label: `Max: Rs ${priceMaxInput}`, key: "price_max" } : null,
    sortInput ? { label: `Sort: ${sortInput.replace(/_/g, " ")}`, key: "sort" } : null,
  ].filter(Boolean) as Array<{ label: string; key: string }>;

  function clearChip(key: string): void {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(key);
    if (key === "availability") {
      setAvailabilityInput("");
    }
    if (key === "price_min") {
      setPriceMinInput("");
    }
    if (key === "price_max") {
      setPriceMaxInput("");
    }
    if (key === "sort") {
      const nextSort = activeMode === "nearby" ? "nearest" : "relevance";
      setSortInput(nextSort);
      nextParams.set("sort", nextSort);
    }
    nextParams.set("page", "1");
    updateSearchParams(nextParams);
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box
        rounded="3xl"
        p={{ base: 5, md: 8 }}
        bgGradient="linear(135deg, rgba(255,255,255,0.92), rgba(244,247,255,0.88))"
        borderWidth="1px"
        borderColor="blackAlpha.100"
        boxShadow="0 24px 60px rgba(15,23,42,0.08)"
      >
        <HStack justify="space-between" align="start" spacing={6} flexWrap="wrap">
          <Box maxW="3xl">
            <Heading size="xl" mb={3} letterSpacing="-0.03em">
              Search PGs the way users actually decide.
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Search by city or around your current location, refine the list, compare options, and open a listing when it feels close.
            </Text>
          </Box>
          <Box minW={{ base: "full", md: "240px" }}>
            <Card bg="white" borderRadius="2xl" borderColor="blackAlpha.100" borderWidth="1px">
              <CardBody>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Current search state
                </Text>
                <Heading size="md">{resultCountLabel}</Heading>
                <Text color="gray.600" mt={2}>
                  {hasSearch ? "You can keep refining without leaving the page." : "Start with a city or nearby radius."}
                </Text>
              </CardBody>
            </Card>
          </Box>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" boxShadow="0 18px 44px rgba(15,23,42,0.06)">
          <CardBody>
            <form onSubmit={handleCitySubmit}>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading size="md" mb={2}>
                    Search by city
                  </Heading>
                  <Text color="gray.600">Enter a city and jump directly into nearby results for that location.</Text>
                </Box>
                {validationMessage ? (
                  <Alert status="warning" rounded="xl">
                    <AlertIcon />
                    {validationMessage}
                  </Alert>
                ) : null}
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input value={cityInput} onChange={(event) => setCityInput(event.target.value)} placeholder="Hyderabad" />
                </FormControl>
                <HStack spacing={2} flexWrap="wrap">
                  {recentCities.map((cityName) => (
                    <Button key={cityName} type="button" size="sm" variant="ghost" onClick={() => setCityInput(cityName)}>
                      {cityName}
                    </Button>
                  ))}
                </HStack>
                <Button type="submit" colorScheme="blue" alignSelf="start">
                  Search city
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <Card borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" boxShadow="0 18px 44px rgba(15,23,42,0.06)">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="md" mb={2}>
                  Nearby search
                </Heading>
                <Text color="gray.600">Use a radius and location context to find listings near where you already are.</Text>
              </Box>
              {locationMessage ? (
                <Alert status="warning" rounded="xl">
                  <AlertIcon />
                  {locationMessage}
                </Alert>
              ) : null}
              <Box rounded="xl" p={4} bg="blue.50" borderWidth="1px" borderColor="blue.100">
                <Text fontSize="sm" color="gray.500">
                  Location context
                </Text>
                <HStack justify="space-between" align="start" mt={1}>
                  <Text fontWeight="medium">{locationContext ? locationContext.label : "No location selected"}</Text>
                  <HStack spacing={2}>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setLocationContext(defaultLocation)}>
                      Use current location
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setLocationContext(null)}>
                      Clear
                    </Button>
                  </HStack>
                </HStack>
              </Box>
              <FormControl>
                <FormLabel>Radius</FormLabel>
                <Select value={radiusInput} onChange={(event) => setRadiusInput(event.target.value)}>
                  {radiusOptions.map((radiusValue) => (
                    <option key={radiusValue} value={radiusValue}>
                      {radiusValue} km
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button type="button" colorScheme="teal" alignSelf="start" onClick={handleNearbySubmit}>
                Search nearby
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" boxShadow="0 18px 44px rgba(15,23,42,0.05)">
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="start" flexWrap="wrap">
              <Box>
                <Heading size="md" mb={1}>
                  Filter and sort results
                </Heading>
                <Text color="gray.600">Tune the current result set without leaving the search flow.</Text>
              </Box>
              <HStack>
                <Button size="sm" variant="outline" onClick={resetFilters} isDisabled={!activeFilterChips.length}>
                  Reset filters
                </Button>
                <Button size="sm" colorScheme="blue" onClick={applyFilters} isDisabled={!hasSearch}>
                  Apply filters
                </Button>
              </HStack>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <FormControl>
                <FormLabel>Availability</FormLabel>
                <Select value={availabilityInput} onChange={(event) => setAvailabilityInput(event.target.value)}>
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="full">Full</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Minimum price</FormLabel>
                <Input value={priceMinInput} onChange={(event) => setPriceMinInput(event.target.value)} placeholder="0" inputMode="numeric" />
              </FormControl>
              <FormControl>
                <FormLabel>Maximum price</FormLabel>
                <Input value={priceMaxInput} onChange={(event) => setPriceMaxInput(event.target.value)} placeholder="12000" inputMode="numeric" />
              </FormControl>
              <FormControl>
                <FormLabel>Sort</FormLabel>
                <Select value={sortInput} onChange={(event) => setSortInput(event.target.value)}>
                  {activeSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>
            {activeFilterChips.length ? (
              <HStack spacing={2} flexWrap="wrap">
                {activeFilterChips.map((chip) => (
                  <Button key={chip.key} size="xs" variant="subtle" onClick={() => clearChip(chip.key)}>
                    {chip.label}
                  </Button>
                ))}
              </HStack>
            ) : null}
          </VStack>
        </CardBody>
      </Card>

      {compareMessage ? (
        <Alert status="warning" rounded="xl">
          <AlertIcon />
          {compareMessage}
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert status="error" rounded="xl">
          <AlertIcon />
          {errorMessage}
        </Alert>
      ) : null}

      {hasSearch ? (
        <Card borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100">
          <CardBody>
            <VStack align="stretch" spacing={6}>
              <HStack justify="space-between" align="start" flexWrap="wrap">
                <Box>
                  <Heading size="md" mb={1}>
                    Search results
                  </Heading>
                  <Text color="gray.600">Update the city, radius, filters, or sort order from this same view.</Text>
                </Box>
                <Button colorScheme="purple" onClick={openCompare} isDisabled={selectedIds.length < 2}>
                  Compare selected ({selectedIds.length})
                </Button>
              </HStack>

              {loading ? (
                <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Box key={index} borderWidth="1px" borderRadius="2xl" p={5} bg="white">
                      <Skeleton height="24px" mb={3} />
                      <SkeletonText noOfLines={4} spacing="3" />
                    </Box>
                  ))}
                </SimpleGrid>
              ) : results && results.items.length > 0 ? (
                <>
                  <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                    {results.items.map((listing) => (
                      <ListingSummaryCard
                        key={listing.id}
                        listing={listing}
                        detailHref={`${basePath}/listings/${listing.id}?returnTo=${encodeURIComponent(activeReturnTo)}`}
                        compareChecked={selectedIds.includes(listing.id)}
                        onToggleCompare={toggleCompare}
                      />
                    ))}
                  </SimpleGrid>

                  <Divider />

                  <HStack justify="space-between" flexWrap="wrap">
                    <Button variant="outline" onClick={() => updatePage(Math.max(1, (results.pagination.page ?? 1) - 1))} isDisabled={results.pagination.page <= 1}>
                      Previous
                    </Button>
                    <Text color="gray.600">
                      Page {results.pagination.page} of {Math.max(results.pagination.total_pages, 1)}
                    </Text>
                    <Button
                      variant="outline"
                      onClick={() => updatePage(results.pagination.page + 1)}
                      isDisabled={results.pagination.page >= results.pagination.total_pages || results.pagination.total_pages === 0}
                    >
                      Next
                    </Button>
                  </HStack>
                </>
              ) : (
                <Box borderWidth="1px" borderStyle="dashed" rounded="2xl" p={8} textAlign="center" bg="white">
                  <Heading size="md" mb={2}>
                    {activeMode === "nearby" ? "No nearby listings found" : "No listings found for this city"}
                  </Heading>
                  <Text color="gray.600" mb={5}>
                    {activeMode === "nearby"
                      ? "Try widening the radius or clearing filters to surface more options."
                      : "Try another city or clear filters to broaden the result set."}
                  </Text>
                  <HStack justify="center" spacing={3}>
                    <Button variant="outline" onClick={resetFilters}>
                      Clear filters
                    </Button>
                    <Button as={RouterLink} to={basePath} colorScheme="blue">
                      Start over
                    </Button>
                  </HStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "1.3fr 0.7fr" }} gap={6}>
          <Card borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100">
            <CardBody>
              <Heading size="md" mb={2}>
                No search submitted yet
              </Heading>
              <Text color="gray.600">
                Use the city or nearby search panels above to start the discovery flow, then refine results in place.
              </Text>
            </CardBody>
          </Card>
          <Card borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="whiteAlpha.900">
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Heading size="sm">Quick actions</Heading>
                <Text color="gray.600">Recent cities and the nearby location selector are tuned for the main search journey.</Text>
                <Button variant="outline" colorScheme="blue" onClick={() => setCityInput("Hyderabad")}>Prefill Hyderabad</Button>
                <Button variant="outline" colorScheme="teal" onClick={() => setLocationContext(defaultLocation)}>
                  Restore nearby location
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      )}
    </VStack>
  );
}
