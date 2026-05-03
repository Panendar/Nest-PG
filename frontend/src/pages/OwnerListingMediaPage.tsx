import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "../api/client";
import {
  addOwnerListingMedia,
  deleteOwnerListingMedia,
  listOwnerListingMedia,
  updateOwnerListingMedia,
  type OwnerListingMediaItem,
} from "../api/ownerListings";

export function OwnerListingMediaPage() {
  const { listingId } = useParams();
  const [items, setItems] = useState<OwnerListingMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadMedia = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listOwnerListingMedia(listingId);
      setItems(result.items);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We could not load listing photos right now."));
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !listingId) return;
    setUploading(true);
    setError(null);
    try {
      await addOwnerListingMedia(listingId, { file, caption: "Uploaded photo", sort_order: items.length + 1 });
      await loadMedia();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We could not upload this photo."));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleRemove(mediaId: string) {
    if (!listingId) return;
    setError(null);
    try {
      await deleteOwnerListingMedia(listingId, mediaId);
      await loadMedia();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We could not remove this photo right now."));
    }
  }

  async function handleReplace(mediaId: string, file: File | null) {
    if (!listingId || !file) return;
    setError(null);
    try {
      await updateOwnerListingMedia(listingId, mediaId, { file });
      await loadMedia();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We could not replace this photo right now."));
    }
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Heading size="lg">Listing media</Heading>
      <Card borderRadius="2xl" borderWidth="1px" borderColor="surface.border">
        <CardBody>
          <VStack align="stretch" spacing={4}>
            {error ? (
              <Alert status="error" borderRadius="xl">
                <AlertIcon />
                {error}
              </Alert>
            ) : null}
            <HStack justify="space-between" align="center">
              <Text color="gray.700">Add, replace, or remove listing photos.</Text>
              <Button as="label" htmlFor="owner-media-upload" isLoading={uploading}>
                Add photos
              </Button>
            </HStack>
            <Input id="owner-media-upload" type="file" accept="image/*" display="none" onChange={handleUpload} />

            {loading ? (
              <Text color="gray.600">Loading media...</Text>
            ) : items.length === 0 ? (
              <Box borderWidth="1px" borderColor="surface.border" borderRadius="xl" p={5}>
                <Text color="gray.700">No photos yet. Add your first photo.</Text>
              </Box>
            ) : (
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                {items.map((item) => (
                  <Box key={item.id} borderWidth="1px" borderColor="surface.border" borderRadius="xl" p={4}>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold" noOfLines={1}>
                          {item.file_url}
                        </Text>
                        {item.is_primary ? <Badge colorScheme="green">Primary</Badge> : null}
                      </HStack>
                      <Text fontSize="sm" color="gray.700">
                        {item.caption || "No caption"}
                      </Text>
                      <HStack>
                        <Button as="label" size="sm" variant="outline">
                          Replace
                          <Input
                            type="file"
                            accept="image/*"
                            display="none"
                            onChange={(e) => handleReplace(item.id, e.target.files?.[0] ?? null)}
                          />
                        </Button>
                        <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleRemove(item.id)}>
                          Remove
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </Grid>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
