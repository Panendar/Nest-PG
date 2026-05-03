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
  NumberInput,
  NumberInputField,
  Select,
  Skeleton,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "../api/client";
import { getOwnerListing, updateOwnerListingDetails, type OwnerListingDetail } from "../api/ownerListings";

type FormState = {
  pg_name: string;
  city: string;
  area: string;
  monthly_rent: number;
  occupancy_type: string;
  available_units: number;
  description: string;
  amenities: string;
  listing_status: string;
};

function toForm(detail: OwnerListingDetail): FormState {
  return {
    pg_name: detail.pg_name,
    city: detail.city,
    area: detail.area,
    monthly_rent: detail.monthly_rent,
    occupancy_type: detail.occupancy_type,
    available_units: detail.available_units,
    description: detail.description,
    amenities: detail.amenities.join(", "),
    listing_status: detail.listing_status,
  };
}

export function OwnerEditListingPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    async function run() {
      if (!listingId) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const detail = await getOwnerListing(listingId);
        setForm(toForm(detail));
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "We could not load this listing right now."));
      } finally {
        setLoading(false);
      }
    }
    void run();
  }, [listingId]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!listingId || !form) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateOwnerListingDetails(listingId, {
        ...form,
        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      navigate(`/owner/listings/${listingId}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We could not save your changes right now. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Skeleton h="240px" borderRadius="2xl" />;
  }

  if (!form) {
    return (
      <Alert status="error" borderRadius="xl">
        <AlertIcon />
        {error ?? "Listing not available"}
      </Alert>
    );
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Heading size="lg">Edit listing details</Heading>
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
              <FormLabel>PG name</FormLabel>
              <Input value={form.pg_name} onChange={(e) => setForm((prev) => (prev ? { ...prev, pg_name: e.target.value } : prev))} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>City</FormLabel>
              <Input value={form.city} onChange={(e) => setForm((prev) => (prev ? { ...prev, city: e.target.value } : prev))} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Area</FormLabel>
              <Input value={form.area} onChange={(e) => setForm((prev) => (prev ? { ...prev, area: e.target.value } : prev))} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Monthly rent</FormLabel>
              <NumberInput
                min={1}
                value={form.monthly_rent}
                onChange={(_, n) => setForm((prev) => (prev ? { ...prev, monthly_rent: n || 1 } : prev))}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Occupancy type</FormLabel>
              <Input
                value={form.occupancy_type}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, occupancy_type: e.target.value } : prev))}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Available units</FormLabel>
              <NumberInput
                min={0}
                value={form.available_units}
                onChange={(_, n) => setForm((prev) => (prev ? { ...prev, available_units: n || 0 } : prev))}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Listing status</FormLabel>
              <Select
                value={form.listing_status}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, listing_status: e.target.value } : prev))}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Amenities (comma separated)</FormLabel>
              <Input value={form.amenities} onChange={(e) => setForm((prev) => (prev ? { ...prev, amenities: e.target.value } : prev))} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                minH="140px"
                value={form.description}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
              />
            </FormControl>
            <Button type="submit" isLoading={saving} loadingText="Saving changes">
              Save changes
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
