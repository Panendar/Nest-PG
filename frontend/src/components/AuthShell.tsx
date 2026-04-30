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
      bgGradient="linear(to-br, #eff4ff 0%, #f7faff 48%, #fff6e8 100%)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-160px"
        right="-90px"
        w="360px"
        h="360px"
        bg="brand.200"
        rounded="full"
        opacity={0.9}
        filter="blur(18px)"
      />
      <Box
        position="absolute"
        bottom="-160px"
        left="-100px"
        w="420px"
        h="420px"
        bg="accent.100"
        rounded="full"
        opacity={0.75}
        filter="blur(28px)"
      />
      <Box
        w="full"
        maxW="520px"
        p={{ base: 6, md: 8 }}
        rounded="3xl"
        borderWidth="1px"
        borderColor="surface.border"
        bg="surface.panel"
        boxShadow="0 32px 80px rgba(15, 23, 42, 0.14)"
        backdropFilter="blur(14px)"
      >
        <Heading size="lg" mb={2} color="gray.900" letterSpacing="-0.03em">
          {title}
        </Heading>
        <Text color="gray.700" mb={7} fontSize="md">
          {subtitle}
        </Text>
        {children}
        {footer ? <Box mt={6}>{footer}</Box> : null}
      </Box>
    </Flex>
  );
}
