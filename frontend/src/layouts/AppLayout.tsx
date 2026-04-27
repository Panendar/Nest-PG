import { Box, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

import { getModuleBasePath, readLastSearchContext } from "../utils/navigation";

export function AppLayout() {
  const location = useLocation();
  const basePath = getModuleBasePath(location.pathname);
  const navItems = [
    { label: "Search", to: readLastSearchContext(`${basePath}/search`), matchPrefix: `${basePath}/search` },
    { label: "Compare", to: `${basePath}/compare`, matchPrefix: `${basePath}/compare` },
    { label: "Saved", to: `${basePath}/saved`, matchPrefix: `${basePath}/saved` },
    { label: "Recent", to: `${basePath}/recent-searches`, matchPrefix: `${basePath}/recent-searches` },
  ];

  return (
    <Flex minH="100vh" bgGradient="linear(to-br, #f7f4ef 0%, #f6faf8 55%, #eef2ff 100%)">
      <Box
        as="aside"
        w={{ base: "88px", md: "280px" }}
        bg="rgba(255,255,255,0.82)"
        backdropFilter="blur(16px)"
        borderRightWidth="1px"
        borderColor="blackAlpha.100"
        p={5}
      >
        <Heading size="sm" mb={2} letterSpacing="0.08em" textTransform="uppercase">
          My_PG
        </Heading>
        <Text fontSize="sm" color="gray.500" mb={8}>
          User discovery workspace
        </Text>
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
              bg={location.pathname.startsWith(item.matchPrefix) ? "blue.50" : "transparent"}
              color={location.pathname.startsWith(item.matchPrefix) ? "blue.700" : "gray.700"}
              fontWeight={location.pathname.startsWith(item.matchPrefix) ? "semibold" : "medium"}
              _hover={{ bg: "blue.50", textDecoration: "none" }}
            >
              {item.label}
            </Link>
          ))}
        </VStack>
      </Box>
      <Box as="main" flex="1" p={{ base: 4, md: 8 }}>
        <Outlet />
      </Box>
    </Flex>
  );
}
