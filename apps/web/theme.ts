import { extendTheme } from "@chakra-ui/react";
import "@fontsource-variable/plus-jakarta-sans";

export const theme = extendTheme({
  fonts: {
    heading: `'Plus Jakarta Sans', sans-serif`,
    body: `'Plus Jakarta Sans', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: "#1e1e1e",
      },
    },
  },
});
