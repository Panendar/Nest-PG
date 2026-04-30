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
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Textarea,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { createContact, getContact, type ContactCreateResponse, type ContactStatusResponse } from "../api/contacts";
import { getListing, type ListingDetail } from "../api/listings";
import { createSavedListing, deleteSavedListing, getSavedListings, type SavedListingItem } from "../api/savedListings";
import { formatDistance, formatPrice } from "../components/ListingCards";
import { useUI } from "../state/UIContext";
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

function getApiStatus(error: unknown): number | null {
  return axios.isAxiosError(error) ? error.response?.status ?? null : null;
}

function isValidPhone(phone: string): boolean {
  return /^[+()\-\d\s]{7,32}$/.test(phone.trim());
}

function getOwnerDisplayLabel(listing: ListingDetail | null): string {
  if (!listing) {
    return "Owner contact";
  }

  // SPEC GAP: owner display names are not available in the current listing payload,
  // so the UI falls back to the owner's email as the visible contact reference.
  return listing.owner.email;
}

export function ListingDetailsPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [savedEntry, setSavedEntry] = useState<SavedListingItem | null>(null);
  const [savingBusy, setSavingBusy] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactValidation, setContactValidation] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ContactCreateResponse | null>(null);
  const [contactStatus, setContactStatus] = useState<ContactStatusResponse | null>(null);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");

  const basePath = useMemo(() => getModuleBasePath(location.pathname), [location.pathname]);
  const returnTo = searchParams.get("returnTo") || readLastSearchContext(`${basePath}/search`);
  const fromSaved = searchParams.get("fromSaved") === "1";
  const queryContactId = searchParams.get("contact_id");
  const openContactFromQuery = searchParams.get("openContact") === "1";
  const compareHref = `${basePath}/compare?listing_ids=${encodeURIComponent(listingId ?? "")}&returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!listingId) {
      return;
    }

    let active = true;
    void (async () => {
      try {
        const saved = await getSavedListings(1, 50);
        if (!active) {
          return;
        }
        const matched = saved.items.find((item) => item.listing_id === listingId) ?? null;
        setSavedEntry(matched);
      } catch {
        if (active) {
          setSavedEntry(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [listingId]);

  useEffect(() => {
    if (!openContactFromQuery || !listing) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("openContact");
    setSearchParams(nextParams, { replace: true });

    if (listing.accepting_inquiries) {
      openContactForm();
    }
  }, [listing, openContactFromQuery, searchParams, setSearchParams]);

  useEffect(() => {
    if (!queryContactId) {
      setContactStatus(null);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const data = await getContact(queryContactId);
        if (active) {
          setContactStatus(data);
        }
      } catch {
        if (active) {
          setContactStatus(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [queryContactId]);

  useEffect(() => {
    if (!listingId) {
      setErrorMessage("We could not identify this listing. Please open it again from search results.");
      setErrorStatus(400);
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
          setErrorStatus(null);
          setListing(detail);
        }
      } catch (error) {
        if (active) {
          setErrorStatus(getApiStatus(error));
          setErrorMessage(
            getApiMessage(error, "Something went wrong while loading this listing. Please try again.")
          );
          setListing(null);
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

  function openContactForm(): void {
    setContactValidation(null);
    setContactError(null);
    setContactOpen(true);
  }

  async function handleSaveToggle(): Promise<void> {
    if (!listingId) {
      return;
    }
    setSavingBusy(true);
    setErrorMessage(null);
    try {
      if (savedEntry) {
        await deleteSavedListing(savedEntry.id);
        setSavedEntry(null);
        showToast({
          title: "Removed from saved",
          description: `${listing?.title ?? "Listing"} was removed from your saved listings.`,
          status: "info",
        });
      } else {
        const created = await createSavedListing(listingId);
        setSavedEntry({
          id: created.id,
          listing_id: created.listing_id,
          saved_at: created.saved_at,
          listing_summary: {
            id: listingId,
            title: listing?.title ?? "Listing",
            city: listing?.city ?? "",
            availability_status: listing?.availability_status ?? "available",
            accepting_inquiries: listing?.accepting_inquiries ?? true,
            price: listing?.price ?? 0,
            distance_km: null,
          },
        });
        showToast({
          title: "Listing saved",
          description: `${listing?.title ?? "Listing"} is ready to revisit later.`,
          status: "success",
        });
      }
    } catch (error) {
      setErrorMessage(getApiMessage(error, "Could not update saved listings right now."));
    } finally {
      setSavingBusy(false);
    }
  }

  async function submitContact(): Promise<void> {
    if (!listingId || !listing) {
      return;
    }

    const normalizedName = fullName.trim().replace(/\s+/g, " ");
    const normalizedPhone = phoneNumber.trim();
    const normalizedMessage = message.trim().replace(/\s+/g, " ");

    if (normalizedName.length < 2) {
      setContactValidation("Please enter your full name.");
      return;
    }
    if (!isValidPhone(normalizedPhone)) {
      setContactValidation("Enter a valid phone number so the owner can reach you.");
      return;
    }
    if (normalizedMessage.length < 10) {
      setContactValidation("Please add a few more details about your inquiry.");
      return;
    }
    if (moveInDate) {
      const selectedDate = new Date(`${moveInDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setContactValidation("Preferred move-in date must be today or later.");
        return;
      }
    }

    setContactBusy(true);
    setContactError(null);
    setContactValidation(null);
    try {
      const response = await createContact({
        listing_id: listingId,
        full_name: normalizedName,
        phone_number: normalizedPhone,
        preferred_move_in_date: moveInDate || null,
        message: normalizedMessage,
      });

      setConfirmation(response);
      setContactOpen(false);
      setContactStatus(await getContact(response.id));
      showToast({
        title: "Inquiry sent",
        description: `Your inquiry for ${listing.title} was sent successfully.`,
        status: "success",
      });

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("contact_id", response.id);
      nextParams.delete("openContact");
      setSearchParams(nextParams, { replace: true });
    } catch (error) {
      setContactError(getApiMessage(error, "Something went wrong while sending your inquiry. Please try again."));
    } finally {
      setContactBusy(false);
    }
  }

  const canContact = Boolean(listing?.accepting_inquiries);
  const isUnavailableListing = errorStatus === 404 || errorStatus === 410;
  const ownerDisplayLabel = getOwnerDisplayLabel(listing);

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="start" flexWrap="wrap">
        <Box>
          <Heading size="xl" letterSpacing="-0.03em">
            Listing details
          </Heading>
          <Text color="gray.700" mt={2}>
            Review the listing before returning to results, comparing, or taking the next step.
          </Text>
        </Box>
        <HStack>
          <Button as={RouterLink} to={returnTo} variant="outline">
            Back to results
          </Button>
          <Button as={RouterLink} to={compareHref} isDisabled={!listing || isUnavailableListing}>
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
      ) : isUnavailableListing ? (
        <Card borderRadius="2xl" borderWidth="1px">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">This listing is no longer available.</Heading>
              <Text color="gray.700">Please return to search results and choose another listing.</Text>
              <HStack>
                <Button as={RouterLink} to={returnTo}>
                  Return to results
                </Button>
                <Button as={RouterLink} to={returnTo} variant="outline">
                  View other listings
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ) : listing ? (
        <Grid templateColumns={{ base: "1fr", lg: "1.25fr 0.75fr" }} gap={6}>
          <Card borderRadius="2xl" borderWidth="1px" boxShadow="0 18px 44px rgba(15,23,42,0.06)">
            <CardBody>
              <VStack align="stretch" spacing={5}>
                <Box>
                  <HStack spacing={2} mb={3} flexWrap="wrap">
                    <Badge colorScheme="brand">{listing.city}</Badge>
                    <Badge colorScheme={listing.accepting_inquiries ? "green" : "gray"}>
                      {listing.accepting_inquiries ? "Accepting inquiries" : "Not accepting inquiries"}
                    </Badge>
                    <Badge colorScheme={listing.availability_status === "available" ? "green" : listing.availability_status === "limited" ? "orange" : "gray"}>
                      {listing.availability_status}
                    </Badge>
                    {savedEntry ? <Badge colorScheme="green">Saved</Badge> : null}
                    {formatDistance(listing.distance_km) ? <Badge colorScheme="purple">{formatDistance(listing.distance_km)}</Badge> : null}
                  </HStack>
                  <Heading size="lg">{listing.title}</Heading>
                  <Text color="gray.700" mt={3}>
                    {listing.description}
                  </Text>
                </Box>

                {contactStatus ? (
                  <Card borderRadius="xl" borderWidth="1px" borderColor={contactStatus.status === "closed" ? "orange.200" : "green.200"} bg={contactStatus.status === "closed" ? "orange.50" : "green.50"}>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Box>
                          <Heading size="sm" mb={1}>
                            Inquiry status: {contactStatus.status === "closed" ? "Closed" : "Open"}
                          </Heading>
                          <Text color="gray.700">Last inquiry: {new Date(contactStatus.submitted_at).toLocaleString()}</Text>
                        </Box>
                        <Text color="gray.700">
                          {contactStatus.status === "closed"
                            ? "This listing is not accepting new inquiries right now. Please return to search results and choose another."
                            : "You can still follow up on this listing from the current detail view."}
                        </Text>
                        <HStack>
                          {contactStatus.can_contact_again ? (
                            <Button size="sm" colorScheme="green" onClick={openContactForm}>
                              Contact owner again
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" isDisabled>
                              Contact unavailable
                            </Button>
                          )}
                          <Button as={RouterLink} to={returnTo} size="sm" variant="ghost">
                            Return to browse
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : null}

                {!canContact ? (
                  <Card borderRadius="xl" borderWidth="1px" borderColor="orange.200" bg="orange.50">
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Box>
                          <Heading size="sm" mb={1}>
                            Contact status: Not accepting inquiries
                          </Heading>
                          <Text color="gray.700">This listing is not accepting inquiries right now. You can keep browsing other PG options.</Text>
                        </Box>
                        <HStack>
                          <Button as={RouterLink} to={returnTo} size="sm" colorScheme="orange">
                            Return to results
                          </Button>
                          <Button as={RouterLink} to={returnTo} size="sm" variant="ghost">
                            Browse more listings
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : null}

                {confirmation ? (
                  <Card borderRadius="xl" borderWidth="1px" bg="green.50" borderColor="green.200">
                    <CardBody>
                      <VStack align="stretch" spacing={2}>
                        <Heading size="sm">Inquiry sent successfully</Heading>
                        <Text color="gray.700">For listing: {listing.title}</Text>
                        <Text color="gray.700">To owner: {ownerDisplayLabel}</Text>
                        <Text color="gray.700">Sent at: {new Date(confirmation.submitted_at).toLocaleString()}</Text>
                        <Text color="gray.700">We will notify you when the owner responds.</Text>
                        <HStack>
                          <Button as={RouterLink} to={returnTo} size="sm" colorScheme="green">
                            Back to Results
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmation(null)}>
                            View Listing
                          </Button>
                          <Button as={RouterLink} to={returnTo} size="sm" variant="ghost">
                            Continue Search
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
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
                  <Text fontWeight="medium">{ownerDisplayLabel}</Text>
                  <Text color="gray.700">Role: {listing.owner.role}</Text>
                  <Text color="gray.700">Owner ID: {listing.owner.id}</Text>
                </Stack>
              </CardBody>
            </Card>

            <Card borderRadius="2xl" borderWidth="1px">
              <CardBody>
                <Heading size="md" mb={3}>
                  Next actions
                </Heading>
                <VStack align="stretch" spacing={3}>
                  <Button as={RouterLink} to={compareHref}>
                    Compare with search selection
                  </Button>
                  {canContact ? (
                    <Button onClick={openContactForm}>
                      Contact owner
                    </Button>
                  ) : null}
                  {savedEntry ? (
                    <>
                      <Button variant="outline" onClick={() => navigate(`${basePath}/saved`)}>
                        Open saved
                      </Button>
                      <Button variant="outline" onClick={() => void handleSaveToggle()} isLoading={savingBusy}>
                        Remove saved
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => void handleSaveToggle()} isLoading={savingBusy}>
                      Save listing
                    </Button>
                  )}
                  <Button as={RouterLink} to={returnTo} variant="outline">
                    {fromSaved ? "Back to saved" : "Back to results"}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      ) : null}

      <Modal isOpen={contactOpen} onClose={() => setContactOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contact owner</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium">Listing: {listing?.title}</Text>
                <Text color="gray.700">Owner: {ownerDisplayLabel}</Text>
              </Box>

              {contactValidation ? (
                <Alert status="warning" rounded="xl">
                  <AlertIcon />
                  {contactValidation}
                </Alert>
              ) : null}

              {contactError ? (
                <Alert status="error" rounded="xl">
                  <AlertIcon />
                  {contactError}
                </Alert>
              ) : null}

              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Priya Sharma" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <Input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+91 98765 43210" />
              </FormControl>

              <FormControl>
                <FormLabel>Move-in date</FormLabel>
                <Input type="date" value={moveInDate} onChange={(event) => setMoveInDate(event.target.value)} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Need a room from mid-May." minH="120px" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={() => setContactOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => {
                  void submitContact();
                }}
                isLoading={contactBusy}
              >
                Send Inquiry
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
