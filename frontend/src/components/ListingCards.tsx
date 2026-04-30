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

function badgePalette(colorScheme: string): { bg: string; color: string; borderColor: string } {
  if (colorScheme === "green") {
    return { bg: "green.50", color: "green.800", borderColor: "green.200" };
  }
  if (colorScheme === "orange") {
    return { bg: "orange.50", color: "orange.800", borderColor: "orange.200" };
  }
  if (colorScheme === "purple") {
    return { bg: "purple.50", color: "purple.800", borderColor: "purple.200" };
  }
  if (colorScheme === "gray") {
    return { bg: "gray.100", color: "gray.700", borderColor: "gray.200" };
  }
  return { bg: "brand.50", color: "brand.800", borderColor: "brand.200" };
}

type ListingSummaryCardProps = {
  listing: ListingSummary;
  detailHref: string;
  contactHref: string;
  compareChecked: boolean;
  isSaved: boolean;
  saveBusy?: boolean;
  onToggleCompare: (listingId: string) => void;
  onToggleSave: (listing: ListingSummary) => void;
};

export function ListingSummaryCard({
  listing,
  detailHref,
  contactHref,
  compareChecked,
  isSaved,
  saveBusy = false,
  onToggleCompare,
  onToggleSave,
}: ListingSummaryCardProps) {
  const distanceLabel = formatDistance(listing.distance_km);
  const canContact = listing.accepting_inquiries;

  return (
    <Box
      borderWidth="1px"
      borderColor="surface.border"
      rounded="2xl"
      bg="surface.elevated"
      p={5}
      boxShadow="0 16px 40px rgba(15,23,42,0.06)"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="md" lineHeight="shorter">
              {listing.title}
            </Heading>
            <Text color="gray.700" mt={1}>
              {listing.city}
            </Text>
          </Box>
          <Checkbox isChecked={compareChecked} onChange={() => onToggleCompare(listing.id)} colorScheme="brand">
            Compare
          </Checkbox>
        </HStack>

        <HStack spacing={2} flexWrap="wrap">
          <Badge
            bg={badgePalette(availabilityTone(listing.availability_status)).bg}
            color={badgePalette(availabilityTone(listing.availability_status)).color}
            borderWidth="1px"
            borderColor={badgePalette(availabilityTone(listing.availability_status)).borderColor}
            textTransform="capitalize"
          >
            {listing.availability_status}
          </Badge>
          <Badge
            bg={badgePalette(listing.accepting_inquiries ? "brand" : "gray").bg}
            color={badgePalette(listing.accepting_inquiries ? "brand" : "gray").color}
            borderWidth="1px"
            borderColor={badgePalette(listing.accepting_inquiries ? "brand" : "gray").borderColor}
          >
            {listing.accepting_inquiries ? "Accepting inquiries" : "Not accepting inquiries"}
          </Badge>
          {isSaved ? (
            <Badge bg="green.50" color="green.800" borderWidth="1px" borderColor="green.200">
              Saved
            </Badge>
          ) : null}
          {distanceLabel ? (
            <Badge bg="purple.50" color="purple.800" borderWidth="1px" borderColor="purple.200">
              {distanceLabel}
            </Badge>
          ) : null}
        </HStack>

        <Stack spacing={1}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.900">
            {formatPrice(listing.price)} / month
          </Text>
          <Text color="gray.700">Quickly review the listing details before comparing or contacting.</Text>
        </Stack>

        <Stack spacing={2}>
          <HStack justify="space-between" flexWrap="wrap">
            <Button as={RouterLink} to={detailHref} variant="outline">
              View details
            </Button>
            {canContact ? (
              <Button as={RouterLink} to={contactHref}>
                Contact owner
              </Button>
            ) : (
              <Button variant="outline" isDisabled>
                Contact unavailable
              </Button>
            )}
          </HStack>
          <HStack justify="space-between" flexWrap="wrap">
            <Button variant="ghost" colorScheme={isSaved ? "green" : "gray"} isLoading={saveBusy} onClick={() => onToggleSave(listing)}>
              {isSaved ? "Remove saved" : "Save listing"}
            </Button>
            <Text fontSize="sm" color="gray.600">
              ID {listing.id.slice(0, 8)}
            </Text>
          </HStack>
        </Stack>
      </VStack>
    </Box>
  );
}
