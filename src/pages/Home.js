import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import BackImg from "../assets/img/back.png";
import BackImg1 from "../assets/img/back-mobile.png";

const HomePage = () => {
    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                marginTop: { md: "150px", sm: "65px", xs: "65px" },
                height: { md: "1500px", sm: "700px", xs: "700px" },
                backgroundImage: {
                    md: `url(${BackImg})`,
                    sm: `url(${BackImg1})`,
                    xs: `url(${BackImg1})`,
                },
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Box
                sx={{
                    padding: {
                        md: "100px",
                        sm: "500px 80px 80px 80px",
                        xs: "500px 50px 50px 50px",
                    },
                }}
            >
                <Typography
                    fontWeight="bold"
                    sx={{
                        fontSize: { md: "90px", sm: "50px", xs: "35px" },
                        paddingBottom: { md: "40px", sm: "10px", xs: "10px" },
                        textAlign: { md: "left", sm: "center", xs: "center" },
                    }}
                >
                    Lunc Swap Site
                </Typography>
                <Typography
                    fontWeight="800"
                    sx={{
                        fontSize: { md: "24px", sm: "18px", xs: "16px" },
                        paddingBottom: { md: "20px", sm: "15px", xs: "15px" },
                        textAlign: { md: "left", sm: "center", xs: "center" },
                    }}
                >
                    Get started with Lunc Station
                </Typography>
                <Typography
                    fontSize="20px"
                    sx={{
                        fontSize: { md: "20px", sm: "16px", xs: "14px" },
                        textAlign: { md: "left", sm: "center", xs: "center" },
                        maxWidth: 800,
                    }}
                    fontWeight="500"
                >
                    Fueled by a passionate community and deep developer pool,
                    the new Lunc blockchain is one of the most decentralized
                    chains ever launched.
                </Typography>
            </Box>
        </Box>
    );
};

export default HomePage;
