import { Box, Button, Card, CardBody, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../state/AuthContext";

export function BuilderHomePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box minH="100vh" px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }} bgGradient="linear(to-br, #fff8f2 0%, #f6fbff 55%, #eef6f2 100%)">
      <VStack align="stretch" spacing={6} maxW="5xl" mx="auto">
        <Box>
          <Heading size="xl" mb={3}>
            Builder home
          </Heading>
          <Text color="gray.600" fontSize="lg">
            This account is recognized as a PG poster account, so it lands on the builder side first.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <Card borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100">
            <CardBody>
              <Heading size="md" mb={2}>
                Next builder workflow
              </Heading>
              <Text color="gray.600" mb={4}>
                The owner module is only partially built right now, but this is the correct landing page for PG poster accounts.
              </Text>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                Switch account
              </Button>
            </CardBody>
          </Card>

          <Card borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100">
            <CardBody>
              <Heading size="md" mb={2}>
                Planned builder actions
              </Heading>
              <Text color="gray.600">
                Add PG photos, update room details, and manage listing availability from this side of the app.
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
