import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: "Manrope, Segoe UI Variable, Segoe UI, sans-serif",
    body: "Manrope, Segoe UI Variable, Segoe UI, sans-serif",
  },
  colors: {
    brand: {
      50: "#ecf7f3",
      100: "#d6ece4",
      200: "#b1dacb",
      300: "#89c8b1",
      400: "#61b798",
      500: "#3b9f80",
      600: "#297d65",
      700: "#1f654f",
      800: "#1a4f3f",
      900: "#133a2f",
    },
    accent: {
      50: "#fff8ef",
      100: "#ffe9cc",
      200: "#ffd8a2",
      300: "#ffc676",
      400: "#f8af4f",
      500: "#df9336",
      600: "#b97828",
      700: "#945f20",
      800: "#734919",
      900: "#523310",
    },
    surface: {
      canvas: "#f4f6f2",
      panel: "rgba(255, 255, 255, 0.88)",
      border: "#dbe5df",
    },
  },
  radii: {
    xl: "14px",
    "2xl": "18px",
    "3xl": "26px",
  },
  styles: {
    global: {
      body: {
        bg: "surface.canvas",
        color: "#20302b",
      },
      "::selection": {
        bg: "brand.200",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
      baseStyle: {
        borderRadius: "xl",
        fontWeight: 700,
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "xl",
        },
      },
      defaultProps: {
        focusBorderColor: "brand.500",
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: "xl",
        },
      },
      defaultProps: {
        focusBorderColor: "brand.500",
      },
    },
  },
});
