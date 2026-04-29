import { Box, Button, Flex, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

import { getModuleBasePath, readLastSearchContext } from "../utils/navigation";
import { useAuth } from "../state/AuthContext";

export function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const basePath = getModuleBasePath(location.pathname);
  const navItems = [
    { label: "Search", to: readLastSearchContext(`${basePath}/search`), matchPrefix: `${basePath}/search` },
    { label: "Compare", to: `${basePath}/compare`, matchPrefix: `${basePath}/compare` },
    { label: "Saved", to: `${basePath}/saved`, matchPrefix: `${basePath}/saved` },
    { label: "Recent", to: `${basePath}/recent-searches`, matchPrefix: `${basePath}/recent-searches` },
  ];

  return (
    <Flex minH="100vh" bg="surface.canvas">
      <Box
        as="aside"
        w={{ base: "96px", md: "300px" }}
        bg="surface.panel"
        backdropFilter="blur(10px)"
        borderRightWidth="1px"
        borderColor="surface.border"
        p={5}
      >
        <Box rounded="2xl" bg="brand.50" borderWidth="1px" borderColor="brand.200" p={4} mb={8}>
          <Heading size="sm" mb={2} letterSpacing="0.08em" textTransform="uppercase" color="brand.800">
            My_PG
          </Heading>
          <Text fontSize="sm" color="brand.700">
            Discovery Workspace
          </Text>
        </Box>
        <VStack align="stretch" spacing={2}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              as={RouterLink}
              to={item.to}
              p={3}
              rounded="xl"
              borderWidth="1px"
              borderColor={location.pathname.startsWith(item.matchPrefix) ? "brand.400" : "transparent"}
              bg={location.pathname.startsWith(item.matchPrefix) ? "brand.50" : "transparent"}
              color={location.pathname.startsWith(item.matchPrefix) ? "brand.800" : "gray.700"}
              fontWeight={location.pathname.startsWith(item.matchPrefix) ? "semibold" : "medium"}
              _hover={{ bg: "brand.100", textDecoration: "none" }}
            >
              {item.label}
            </Link>
          ))}
        </VStack>
      </Box>
      <Box as="main" flex="1" p={{ base: 4, md: 8 }}>
        <HStack justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="sm" color="gray.500">
              Signed in as
            </Text>
            <Text fontWeight="semibold" color="gray.700">
              {user?.email ?? "user"}
            </Text>
          </Box>
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </HStack>
        <Outlet />
      </Box>
    </Flex>
  );
}
