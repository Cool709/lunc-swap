import React from "react";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from "@mui/material/CssBaseline";

import "../assets/scss/index.scss";

// ** Declare Theme Provider
const MaterialThemeProvider = ({ children }) => {
    const mobile = useMediaQuery("(min-width:800px)");
    const tablet = useMediaQuery("(min-width:1500px)");

    const themeConfig = {
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        boxShadow: "none",
                        textTransform: "none",
                        background: "#e1e4e7",
                        color: "#7E8392",
                        borderColor: "#CFD5E3",
                        "&:hover": {
                            background: "#b2bfd161",
                        },
                    },
                },
            },
            MuiInputBase: {
                styleOverrides: {
                    input: {
                        background: "#e1e4e7",
                        color: "#7E8392",
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        boxShadow: "none",
                        textTransform: "none",
                    },
                },
            },
        },
        palette: {
            background: {
                default: "#EEEDF3",
                paper: "#EEEDF3",
            },
        },
        colors: {
            bg: "rgb(248 248 248 / 68%)",
            cards: "#FFFFFF",
            black: "#000000",
            separator: "#F3F6FD",
            inputs: "#e1e4e7",
            elements: "#CFD5E3",
            green: "#27CEB0",
            red: "#F24646",
            blue: "rgb(9 28 255 / 77%)",
            accent: "#7657F1",
            text_inactive: "#7F8493",
            text_paragraph: "#1E1F22",
            white: "#FFFFFF",
            warning: "#FE9A03",
            titles: "#252734",
            paragraph: "#7E8392",
            input_hover: "#b2bfd161",
            active: "#252734",
            desabled: "#7E8392",
            blackwhite: "#FFFFFF",
            whiteblack: "#000000",
            cardText: "#252734",
            text2: "#7E8392",
            boxShadow:
                "rgb(0 0 0 / 20%) 0px 1px 12px -5px, rgb(0 0 0 / 12%) 0px 1px 2px 0px, rgb(255 255 255 / 4%) 0px 1px 0px 0px inset",
        },
        fonts: {
            headline: 18,
            headline2: 16,
            headline3: 14,
            Cards_title: mobile ? 16 : 14,
            dropdown_amount: mobile ? 14 : 12,
            subTitle: mobile ? 13 : 11,
            mdTitle: mobile ? 12 : 10,
            tabs_small: 12,
            Label: 10,
        },
        isMobile: !mobile,
        isTablet: !tablet,
    };

    const theme = createTheme(themeConfig);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export default MaterialThemeProvider;
