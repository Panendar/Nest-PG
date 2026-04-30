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
        bg="surface.sidebar"
        borderRightWidth="1px"
        borderColor="whiteAlpha.200"
        p={5}
        color="white"
      >
        <Box
          rounded="2xl"
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          p={4}
          mb={8}
          boxShadow="inset 0 1px 0 rgba(255,255,255,0.08)"
        >
          <Heading size="sm" mb={2} letterSpacing="0.08em" textTransform="uppercase" color="white">
            My_PG
          </Heading>
          <Text fontSize="sm" color="blue.100">
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
              borderColor={location.pathname.startsWith(item.matchPrefix) ? "blue.400" : "transparent"}
              bg={location.pathname.startsWith(item.matchPrefix) ? "whiteAlpha.160" : "transparent"}
              color={location.pathname.startsWith(item.matchPrefix) ? "white" : "blue.100"}
              fontWeight={location.pathname.startsWith(item.matchPrefix) ? "semibold" : "medium"}
              _hover={{ bg: "whiteAlpha.120", color: "white", textDecoration: "none" }}
            >
              {item.label}
            </Link>
          ))}
        </VStack>
      </Box>
      <Box as="main" flex="1" p={{ base: 4, md: 8 }}>
        <HStack justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="sm" color="gray.600">
              Signed in as
            </Text>
            <Text fontWeight="semibold" color="gray.900">
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
