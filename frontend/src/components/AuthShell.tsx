import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      px={{ base: 4, md: 8 }}
      bgGradient="linear(to-br, #f7faf8 0%, #e9f2ee 52%, #f9f4ec 100%)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-140px"
        right="-110px"
        w="320px"
        h="320px"
        bg="brand.100"
        rounded="full"
        filter="blur(12px)"
      />
      <Box
        position="absolute"
        bottom="-160px"
        left="-120px"
        w="360px"
        h="360px"
        bg="accent.100"
        rounded="full"
        filter="blur(22px)"
      />
      <Box
        w="full"
        maxW="520px"
        p={{ base: 6, md: 8 }}
        rounded="3xl"
        borderWidth="1px"
        borderColor="surface.border"
        bg="surface.panel"
        boxShadow="0 28px 70px rgba(15, 23, 42, 0.12)"
        backdropFilter="blur(8px)"
      >
        <Heading size="lg" mb={2} color="gray.800">
          {title}
        </Heading>
        <Text color="gray.600" mb={7}>
          {subtitle}
        </Text>
        {children}
        {footer ? <Box mt={6}>{footer}</Box> : null}
      </Box>
    </Flex>
  );
}
