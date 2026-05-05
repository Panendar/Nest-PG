import { Box, Flex, Heading, HStack, Link, Text, VStack, Button } from "@chakra-ui/react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../state/AuthContext";

const navItems = [
  { label: "Overview", to: "/owner/overview", matchPrefix: "/owner/overview" },
  { label: "Listings", to: "/owner/listings", matchPrefix: "/owner/listings" },
  { label: "Media", to: "/owner/media", matchPrefix: "/owner/media" },
  { label: "Availability", to: "/owner/availability", matchPrefix: "/owner/availability" },
];

export function OwnerLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Flex minH="100vh" bgGradient="linear(to-br, #fff9f3 0%, #f8fbff 50%, #f4fbf7 100%)">
      <Box
        as="aside"
        w={{ base: "110px", md: "300px" }}
        bg="#14213d"
        color="white"
        borderRightWidth="1px"
        borderColor="whiteAlpha.200"
        px={{ base: 3, md: 5 }}
        py={5}
      >
        <Box
          rounded="2xl"
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          p={4}
          mb={8}
        >
          <Heading size="sm" mb={2} letterSpacing="0.08em" textTransform="uppercase">
            My_PG
          </Heading>
          <Text fontSize="sm" color="orange.100">
            Owner workspace
          </Text>
        </Box>
        <VStack align="stretch" spacing={2}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.matchPrefix);
            return (
              <Link
                key={item.to}
                as={RouterLink}
                to={item.to}
                px={3}
                py={3}
                rounded="xl"
                borderWidth="1px"
                borderColor={isActive ? "orange.300" : "transparent"}
                bg={isActive ? "whiteAlpha.200" : "transparent"}
                color={isActive ? "white" : "orange.50"}
                fontWeight={isActive ? "semibold" : "medium"}
                _hover={{ bg: "whiteAlpha.100", color: "white", textDecoration: "none" }}
              >
                {item.label}
              </Link>
            );
          })}
        </VStack>
      </Box>

      <Box as="main" flex="1" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }}>
        <HStack justify="space-between" align="center" mb={8}>
          <Box>
            <Text fontSize="sm" color="gray.600">
              Signed in as
            </Text>
            <Text fontWeight="semibold" color="gray.900">
              {user?.email ?? "owner"}
            </Text>
          </Box>
          <Button variant="outline" colorScheme="gray" onClick={logout}>
            Sign out
          </Button>
        </HStack>
        <Outlet />
      </Box>
    </Flex>
  );
}
