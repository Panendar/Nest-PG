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
  SimpleGrid,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../api/client";
import { createOwnerListing } from "../api/ownerListings";

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
  availability_status: string;
  availability_note: string;
};

const initialForm: FormState = {
  pg_name: "",
  city: "",
  area: "",
  monthly_rent: 7000,
  occupancy_type: "double_sharing",
  available_units: 1,
  description: "",
  amenities: "wifi, meals",
  listing_status: "active",
  availability_status: "available",
  availability_note: "",
};

export function OwnerCreateListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const created = await createOwnerListing({
        ...form,
        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        availability_note: form.availability_note || undefined,
      });
      navigate(`/owner/listings/${created.id}`);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "We could not create your listing right now. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Heading size="lg">Create PG listing</Heading>
      <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
        <CardBody>
          <VStack as="form" align="stretch" spacing={4} onSubmit={onSubmit}>
            {error ? (
              <Alert status="error" borderRadius="xl">
                <AlertIcon />
                {error}
              </Alert>
            ) : null}

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>PG name</FormLabel>
                <Input value={form.pg_name} onChange={(e) => setForm((prev) => ({ ...prev, pg_name: e.target.value }))} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>City</FormLabel>
                <Input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Area</FormLabel>
                <Input value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Monthly rent</FormLabel>
                <NumberInput min={1} value={form.monthly_rent} onChange={(_, n) => setForm((prev) => ({ ...prev, monthly_rent: n || 1 }))}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Occupancy type</FormLabel>
                <Input value={form.occupancy_type} onChange={(e) => setForm((prev) => ({ ...prev, occupancy_type: e.target.value }))} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Available units</FormLabel>
                <NumberInput min={0} value={form.available_units} onChange={(_, n) => setForm((prev) => ({ ...prev, available_units: n || 0 }))}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Listing status</FormLabel>
                <Select value={form.listing_status} onChange={(e) => setForm((prev) => ({ ...prev, listing_status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Availability status</FormLabel>
                <Select
                  value={form.availability_status}
                  onChange={(e) => setForm((prev) => ({ ...prev, availability_status: e.target.value }))}
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="full">Full</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Amenities (comma separated)</FormLabel>
              <Input value={form.amenities} onChange={(e) => setForm((prev) => ({ ...prev, amenities: e.target.value }))} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                minH="140px"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Availability note</FormLabel>
              <Input
                value={form.availability_note}
                onChange={(e) => setForm((prev) => ({ ...prev, availability_note: e.target.value }))}
              />
            </FormControl>
            <Button type="submit" isLoading={isSaving} loadingText="Saving listing">
              Save listing
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
