import React, { useContext, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import useTheme from "@mui/material/styles/useTheme";

import { useWeb3React } from "@web3-react/core";
import { injected, netId, RPC_URL } from "../utils/connectors";
import { ReactComponent as WalletIcon } from "../assets/img/wallets/wallet.svg";
import LunaIcon from "../assets/img/luna.png";
import SwapIcon from "../assets/img/swap.png";
import { MultiChainProvider } from "../context/multichain";
import { chainExplorerUrl, chainName, chainNativeToken } from "../config";
import { useHistory, useLocation } from "react-router-dom";

export default function Header() {
    const history = useHistory();
    const location = useLocation();
    const { chainType, currentNet, setCurrentNet } =
        useContext(MultiChainProvider);
    const theme = useTheme();
    const { active, account, chainId, activate, deactivate } = useWeb3React();
    const [open, setOpen] = React.useState(false);

    const handleConnect = () => {
        activate(injected);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleDisconnect = () => {
        deactivate();
        handleClose();
    };

    const switchNetwork = () => {
        if (window.ethereum) {
            window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: `0x${chainId.toString(16)}`,
                    },
                ],
            });
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("chainChanged", (network) => {
                localStorage.setItem("chain", network);
                // setCurrentNet(Number(network));
                window.location.reload();
            });
            window.ethereum.on("accountsChanged", () => {
                window.location.reload();
            });
        }
    });

    useEffect(() => {
        if (currentNet !== chainId) {
            if (chainType.findIndex((v) => v === chainId) !== -1) {
                setCurrentNet(chainId);
                switchNetwork();
                if (!active) {
                    activate(injected);
                }
            }
        } else {
            if (!active) {
                activate(injected);
            }
        }
    });

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="fixed"
                sx={{
                    background: "rgb(255,255,255)",
                    boxShadow: "0px -2px 10px 1px #a3b4c9",
                }}
            >
                <Toolbar
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignSelf: "center",
                        width: (theme) =>
                            theme.isMobile
                                ? "95%"
                                : theme.isTablet
                                ? "80%"
                                : "60%",
                    }}
                >
                    <button
                        style={{ border: "none", backgroundColor: "#FFF" }}
                        onClick={() => {
                            history.push("/");
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems={"center"}
                            spacing={1}
                        >
                            <img
                                src={LunaIcon}
                                alt="Icon"
                                width={theme.isMobile ? "30" : "36"}
                                height={theme.isMobile ? "30" : "36"}
                            />
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    color: (theme) => theme.colors.blue,
                                    fontWeight: "bold",
                                    flexGrow: 1,
                                    fontSize: (theme) =>
                                        theme.isMobile ? 26 : 32,
                                    mb: 0.5,
                                    fontFamily: "Lobster, cursive",
                                    textShadow: "1px 1px 6px white",
                                }}
                            >
                                Lunc {location.pathname !== "/" && "Cash"}
                            </Typography>
                        </Stack>
                    </button>
                    {location.pathname == "/" ? (
                        <Button
                            sx={{
                                background: (theme) => theme.colors.blue,
                                borderRadius: 10,
                                height: 45,
                                color: (theme) =>
                                    `${theme.colors.inputs} !important`,
                                "&:hover": {
                                    background: (theme) => theme.colors.black,
                                },
                                fontWeight: 600,
                            }}
                            onClick={() => {
                                history.push("/swap");
                            }}
                        >
                            Launch App
                        </Button>
                    ) : account ? (
                        <Button
                            onClick={handleClickOpen}
                            startIcon={
                                <WalletIcon style={{ width: 20, height: 20 }} />
                            }
                            variant="outlined"
                            sx={{
                                color: (theme) => theme.colors.blue,
                                borderRadius: 2,
                                borderColor: (theme) => theme.colors.blue,
                                background: "rgb(255,255,255)",
                                minWidth: 120,
                                "&:hover": {
                                    borderColor: (theme) => theme.colors.blue,
                                },
                                "& svg": {
                                    fill: (theme) => theme.colors.blue,
                                },
                            }}
                        >
                            {account.slice(0, 6)} ... {account.slice(-4)}
                        </Button>
                    ) : (
                        <Button
                            startIcon={
                                <WalletIcon style={{ width: 20, height: 20 }} />
                            }
                            variant="outlined"
                            sx={{
                                color: (theme) => theme.colors.blue,
                                borderRadius: 2,
                                borderColor: (theme) => theme.colors.blue,
                                background: "rgb(255,255,255)",
                                minWidth: 120,
                                "&:hover": {
                                    borderColor: (theme) => theme.colors.blue,
                                },
                                "& svg": {
                                    fill: (theme) => theme.colors.blue,
                                },
                            }}
                            onClick={handleConnect}
                        >
                            Connect Wallet
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                        color: (theme) => theme.colors.green,
                        fontWeight: "bold",
                    }}
                >
                    {"Your Wallet Address"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        sx={{ color: (theme) => theme.colors.green }}
                        id="alert-dialog-description"
                    >
                        <code>{account}</code>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        sx={{
                            background: "white",
                            border: (theme) =>
                                `1px solid ${theme.colors.green}`,
                            color: (theme) => theme.colors.green,
                        }}
                    >
                        CLOSE
                    </Button>
                    <Button
                        onClick={handleDisconnect}
                        sx={{
                            background: (theme) => theme.colors.green,
                            color: "white",
                        }}
                    >
                        DISCONNECT
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
