import {
  Alert,
  AlertIcon,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "../api/client";
import { updateOwnerListingAvailability } from "../api/ownerListings";

export function OwnerAvailabilityPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [availabilityNote, setAvailabilityNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!listingId) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await updateOwnerListingAvailability(listingId, {
        availability_status: availabilityStatus,
        availability_note: availabilityNote || undefined,
      });
      navigate(`/owner/listings/${listingId}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We could not update availability right now. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Heading size="lg">Update availability</Heading>
      <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
        <CardBody>
          <VStack as="form" align="stretch" spacing={4} onSubmit={handleSave}>
            {error ? (
              <Alert status="error" borderRadius="xl">
                <AlertIcon />
                {error}
              </Alert>
            ) : null}
            <FormControl isRequired>
              <FormLabel>Availability status</FormLabel>
              <Select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="full">Full</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Availability note</FormLabel>
              <Input value={availabilityNote} onChange={(e) => setAvailabilityNote(e.target.value)} />
            </FormControl>
            <Button type="submit" isLoading={isSaving} loadingText="Saving">
              Save availability
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
