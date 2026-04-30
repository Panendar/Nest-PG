import { extendTheme, type StyleFunctionProps, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

function resolveScheme(colorScheme?: string): string {
  if (!colorScheme || colorScheme === "brand" || colorScheme === "blue" || colorScheme === "teal" || colorScheme === "purple") {
    return "brand";
  }
  return colorScheme;
}

function getTone(colorScheme: string, shade: number): string {
  return `${colorScheme}.${shade}`;
}

export const theme = extendTheme({
  config,
  fonts: {
    heading: "Manrope, Segoe UI Variable, Segoe UI, sans-serif",
    body: "Manrope, Segoe UI Variable, Segoe UI, sans-serif",
  },
  colors: {
    gray: {
      50: "#f8fafc",
      100: "#eef2f6",
      200: "#d9e1ea",
      300: "#bcc9d8",
      400: "#8ea1b5",
      500: "#62758c",
      600: "#48586d",
      700: "#334155",
      800: "#1f2a37",
      900: "#0f172a",
    },
    blue: {
      50: "#eef4ff",
      100: "#d9e7ff",
      200: "#b9d2ff",
      300: "#8db5ff",
      400: "#5d91ff",
      500: "#356dff",
      600: "#1d4ed8",
      700: "#1e40af",
      800: "#1e3a8a",
      900: "#172554",
    },
    purple: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
    teal: {
      50: "#edfdf9",
      100: "#d0f8ee",
      200: "#a5efd9",
      300: "#6ee1c1",
      400: "#37c8a5",
      500: "#14b88f",
      600: "#0d8f72",
      700: "#0f6f5b",
      800: "#11594a",
      900: "#12483d",
    },
    orange: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
    green: {
      50: "#ecfdf3",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
    brand: {
      50: "#eef4ff",
      100: "#d9e7ff",
      200: "#b9d2ff",
      300: "#8db5ff",
      400: "#5d91ff",
      500: "#356dff",
      600: "#1d4ed8",
      700: "#1e40af",
      800: "#1e3a8a",
      900: "#172554",
    },
    accent: {
      50: "#fff8eb",
      100: "#ffecbf",
      200: "#ffd98a",
      300: "#ffc45a",
      400: "#f9a82c",
      500: "#e18811",
      600: "#b86c0d",
      700: "#91540f",
      800: "#6f4110",
      900: "#4f2e0d",
    },
    surface: {
      canvas: "#f4f7fb",
      panel: "rgba(255, 255, 255, 0.96)",
      elevated: "#ffffff",
      sunken: "#edf2f7",
      sidebar: "#0f172a",
      border: "#d9e1ea",
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
        color: "gray.900",
      },
      "::selection": {
        bg: "brand.200",
        color: "gray.900",
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
        letterSpacing: "-0.01em",
        _focusVisible: {
          boxShadow: "0 0 0 3px rgba(29, 78, 216, 0.18)",
        },
      },
      variants: {
        solid: (props: StyleFunctionProps) => {
          const scheme = resolveScheme(props.colorScheme);
          const bg = scheme === "accent" ? getTone(scheme, 500) : getTone(scheme, 600);
          const hover = scheme === "accent" ? getTone(scheme, 600) : getTone(scheme, 700);
          const active = scheme === "accent" ? getTone(scheme, 700) : getTone(scheme, 800);

          return {
            bg,
            color: "white",
            _hover: {
              bg: hover,
              _disabled: {
                bg,
              },
            },
            _active: {
              bg: active,
            },
            _disabled: {
              bg: "gray.300",
              color: "gray.600",
            },
          };
        },
        outline: (props: StyleFunctionProps) => {
          const scheme = resolveScheme(props.colorScheme);
          const textColor = scheme === "gray" ? "gray.800" : getTone(scheme, 700);

          return {
            bg: "surface.elevated",
            color: textColor,
            borderColor: "surface.border",
            _hover: {
              bg: "surface.sunken",
              borderColor: scheme === "gray" ? "gray.400" : getTone(scheme, 200),
            },
            _active: {
              bg: "gray.100",
            },
          };
        },
        ghost: (props: StyleFunctionProps) => {
          const scheme = resolveScheme(props.colorScheme);
          return {
            color: scheme === "gray" ? "gray.800" : getTone(scheme, 700),
            _hover: {
              bg: scheme === "gray" ? "gray.100" : getTone(scheme, 50),
            },
            _active: {
              bg: scheme === "gray" ? "gray.200" : getTone(scheme, 100),
            },
          };
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "xl",
          bg: "surface.elevated",
          borderColor: "surface.border",
          color: "gray.900",
          _placeholder: {
            color: "gray.500",
          },
          _hover: {
            borderColor: "gray.400",
          },
          _focusVisible: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          },
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
          bg: "surface.elevated",
          borderColor: "surface.border",
          color: "gray.900",
          _hover: {
            borderColor: "gray.400",
          },
          _focusVisible: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          },
        },
      },
      defaultProps: {
        focusBorderColor: "brand.500",
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: "xl",
        bg: "surface.elevated",
        borderColor: "surface.border",
        color: "gray.900",
        _placeholder: {
          color: "gray.500",
        },
        _hover: {
          borderColor: "gray.400",
        },
        _focusVisible: {
          borderColor: "brand.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
        },
      },
      defaultProps: {
        focusBorderColor: "brand.500",
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "surface.panel",
          borderColor: "surface.border",
          boxShadow: "0 18px 44px rgba(15, 23, 42, 0.06)",
        },
      },
    },
    Link: {
      baseStyle: {
        color: "brand.700",
        _hover: {
          color: "brand.800",
          textDecoration: "none",
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "surface.elevated",
        },
      },
    },
  },
});
