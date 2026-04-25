import { Badge, Box, Button, Checkbox, HStack, Heading, Stack, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import type { ListingSummary } from "../api/listings";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export function formatDistance(distanceKm: number | null): string | null {
  if (distanceKm === null) {
    return null;
  }
  return `${distanceKm.toFixed(1)} km`;
}

function availabilityTone(status: string): string {
  if (status === "available") {
    return "green";
  }
  if (status === "limited") {
    return "orange";
  }
  return "gray";
}

type ListingSummaryCardProps = {
  listing: ListingSummary;
  detailHref: string;
  compareChecked: boolean;
  onToggleCompare: (listingId: string) => void;
};

export function ListingSummaryCard({ listing, detailHref, compareChecked, onToggleCompare }: ListingSummaryCardProps) {
  const distanceLabel = formatDistance(listing.distance_km);

  return (
    <Box
      borderWidth="1px"
      borderColor="blackAlpha.100"
      rounded="2xl"
      bg="white"
      p={5}
      boxShadow="0 16px 40px rgba(15,23,42,0.06)"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="md" lineHeight="shorter">
              {listing.title}
            </Heading>
            <Text color="gray.600" mt={1}>
              {listing.city}
            </Text>
          </Box>
          <Checkbox isChecked={compareChecked} onChange={() => onToggleCompare(listing.id)} colorScheme="blue">
            Compare
          </Checkbox>
        </HStack>

        <HStack spacing={2} flexWrap="wrap">
          <Badge colorScheme={availabilityTone(listing.availability_status)} textTransform="capitalize">
            {listing.availability_status}
          </Badge>
          <Badge colorScheme={listing.accepting_inquiries ? "blue" : "gray"}>
            {listing.accepting_inquiries ? "Accepting inquiries" : "Not accepting inquiries"}
          </Badge>
          {distanceLabel ? <Badge colorScheme="purple">{distanceLabel}</Badge> : null}
        </HStack>

        <Stack spacing={1}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.900">
            {formatPrice(listing.price)} / month
          </Text>
          <Text color="gray.600">Quickly review the listing details before comparing or contacting.</Text>
        </Stack>

        <HStack justify="space-between">
          <Button as={RouterLink} to={detailHref} variant="outline" colorScheme="blue">
            View details
          </Button>
          <Text fontSize="sm" color="gray.500">
            ID {listing.id.slice(0, 8)}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
