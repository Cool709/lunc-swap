import React from "react";
import Box from "@mui/material/Box";

const Layout = ({ children }) => {
    return (
        <Box
            sx={{
                height: "100%",
                backgroundColor: (theme) => theme.colors.bg,
                alignItems: "center",
            }}
        >
            {children}
        </Box>
    );
};

export default Layout;
