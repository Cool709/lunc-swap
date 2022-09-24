import React, { useContext, useEffect, useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Link } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";

import { toEth, toInt } from "../hooks/hook";
import useAccount from "../hooks/useAccount";
import { CustomInput } from "../components/CustomComponent";
import { chainMainToken, CONTRACTS, TOKEN } from "../config";
import useLiquidity from "../hooks/useLiquidity";
import { ThemeConfig } from "../context/index";
import LUNCICON from "../assets/img/lunc.png";
import BUSDICON from "../assets/img/busd.png";
import USDTICON from "../assets/img/usdt.png";
import { MultiChainProvider } from "../context/multichain";

const Liquidity = () => {
    const { currentNet } = useContext(MultiChainProvider);
    const theme = useTheme();
    const { account } = useWeb3React();
    const { Slippage } = useContext(ThemeConfig);

    const [burned, setBurned] = useState();
    const [warning, setWarning] = useState();
    const [prices, setPrices] = useState({});
    const [approved, setApproved] = useState({
        LUNC: 0,
        [TOKEN]: 0,
    });
    const [balances, setBalances] = useState({});

    const { onAddLiquidity, getBurnedAmount, getCaluedReserveAmount } =
        useLiquidity(currentNet);
    const {
        getBalance,
        getAllowance,
        onApproveLunc,
        onApproveBusd,
        fetchTokenPrices,
    } = useAccount(currentNet);

    const displayName = (name) =>
        name === TOKEN ? chainMainToken(currentNet) : name;
    const displayIcon = (name) =>
        name !== TOKEN
            ? LUNCICON
            : chainMainToken(currentNet) === "BUSD"
            ? BUSDICON
            : USDTICON;

    const [currencys, setCurrencys] = useState([
        {
            address: CONTRACTS[currentNet].LUNC.address,
            name: CONTRACTS[currentNet].LUNC.symbol,
            typeInput: 0,
        },
        {
            address: CONTRACTS[currentNet][TOKEN].address,
            name: CONTRACTS[currentNet][TOKEN].symbol,
            typeInput: 0,
        },
    ]);

    const allowance = useMemo(() => {
        if (
            Number(toEth(currencys[0].typeInput)) >
            Number(balances[currencys[0].name])
        ) {
            return { status: "balance", currency: 0 };
        }

        if (
            Number(toEth(currencys[1].typeInput)) >
            Number(balances[currencys[1].name])
        ) {
            return { status: "balance", currency: 1 };
        }

        if (!currencys[0].typeInput || !currencys[1].typeInput) {
            return { status: "amount", title: "Input correct amount" };
        }

        if (
            Number(toEth(currencys[0].typeInput)) >
            Number(approved[currencys[0].name])
        ) {
            return { status: "approve", currency: 0 };
        }

        if (
            Number(toEth(currencys[1].typeInput)) >
            Number(approved[currencys[1].name])
        ) {
            return { status: "approve", currency: 1 };
        }

        return { status: true };
    }, [approved, currencys, balances]);

    const haldneApprove = async (currency) => {
        if (currency == "LUNC") {
            await onApproveLunc();
        } else {
            await onApproveBusd();
        }
        const allowed = await getAllowance();
        setApproved(allowed);
    };

    const handleConvertCurrency = async () => {
        setCurrencys((prev) => {
            const temp = [prev[1], prev[0]];
            return [...temp];
        });
    };

    const handleCalc = async (i, value) => {
        setCurrencys((prev) => {
            prev[i].typeInput = value;
            return [...prev];
        });

        if (!value || value == 0) {
            if (warning) {
                setWarning("");
            }
            return setCurrencys((prev) => {
                prev[i === 0 ? 1 : 0].typeInput = 0;
                return [...prev];
            });
        }

        let path = [];

        if (i == 0) {
            path = currencys.map((cur) => CONTRACTS[currentNet][cur.name]);
        } else {
            path = [
                CONTRACTS[currentNet][currencys[1].name],
                CONTRACTS[currentNet][currencys[0].name],
            ];
        }
        const result = await getCaluedReserveAmount(value, path);
        setCurrencys((prev) => {
            if (
                Number(
                    toInt(calcDecimal(balances[currencys[i == 0 ? 1 : 0].name]))
                ) < Number(result.toSignificant(6)) &&
                account
            ) {
                prev[i == 0 ? 1 : 0].typeInput = Number(
                    toInt(calcDecimal(balances[currencys[i == 0 ? 1 : 0].name]))
                );
                setWarning(String(i));
            } else {
                prev[i == 0 ? 1 : 0].typeInput = Number(
                    result.toSignificant(6)
                );
                if (warning) {
                    setWarning("");
                }
            }
            return [...prev];
        });
    };

    const calcDecimal = (val) => {
        if (!val || val == "0") return 0;
        val = String(val);
        const calcedVal =
            val.length > 24
                ? val.slice(0, -18) + "0".repeat(18)
                : val.slice(0, 6) + "0".repeat(val.length - 6);
        return calcedVal;
    };

    const handleAddLiquidity = async () => {
        await onAddLiquidity(
            currencys[0].address,
            currencys[1].address,
            currencys[0].typeInput,
            currencys[1].typeInput
        );
        const balances = await getBalance();
        setBalances(balances);
    };

    useEffect(() => {
        (async () => {
            if (account) {
                const balances = await getBalance();
                setBalances(balances);
                const allowed = await getAllowance();
                setApproved(allowed);
            } else {
                setBalances({});
                setApproved({
                    LUNC: 0,
                    [TOKEN]: 0,
                });
            }
            const _burn = await getBurnedAmount();
            setBurned(_burn);
            const _prices = await fetchTokenPrices(currentNet);
            setPrices(_prices);
        })();
    }, [account]);

    return (
        <Stack
            sx={{
                width: (theme) => "100%",
                height: "100%",
                mt: (theme) => (theme.isMobile ? 15 : 20),
                backgroundColor: "#EEEDF3",
            }}
            direction="row"
            justifyContent={"center"}
        >
            <Stack>
                <Stack
                    sx={{
                        width: "100%",
                        p: theme.isMobile ? 0 : 3,
                    }}
                    direction="row"
                    justifyContent={"center"}
                >
                    <Stack
                        sx={{
                            boxShadow: "0px 2px 24px 0px #a3b4c9",
                            borderRadius: 3,
                            width: "100%",
                            background: (theme) => theme.colors.white,
                        }}
                        justifyContent={"space-between"}
                        alignItems="center"
                        direction={theme.isMobile ? "column" : "row"}
                    >
                        <Stack justifyContent={"center"}>
                            <Stack
                                sx={{
                                    pt: 3,
                                    pb: 5,
                                    px: 3,
                                    pl: theme.isMobile ? 3 : 5,
                                    width: theme.isMobile ? "100%" : "450px",
                                }}
                                spacing={2}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent={"space-between"}
                                >
                                    <Stack direction="row" spacing={2}>
                                        <Link
                                            to={"/swap"}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <Button
                                                disableRipple
                                                sx={{
                                                    padding: 0,
                                                    background: "transparent",
                                                    fontWeight: "bold",
                                                    "&:hover": {
                                                        background:
                                                            "transparent",
                                                        color: (theme) =>
                                                            theme.colors.black,
                                                    },
                                                }}
                                            >
                                                Swap
                                            </Button>
                                        </Link>
                                        <Button
                                            disableRipple
                                            sx={{
                                                padding: 0,
                                                background: "transparent",
                                                fontWeight: "bold",
                                                color: (theme) =>
                                                    theme.colors.red,
                                                "&:hover": {
                                                    background: "transparent",
                                                    color: (theme) =>
                                                        theme.colors.red,
                                                },
                                            }}
                                        >
                                            Add Liquidity
                                        </Button>
                                    </Stack>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                    >
                                        <Typography fontSize={13}>
                                            Slippage: {Slippage}%
                                        </Typography>
                                        <Stack direction="row">
                                            <Link
                                                to={"/setting"}
                                                style={{
                                                    textDecoration: "none",
                                                }}
                                            >
                                                <IconButton>
                                                    <SettingsOutlinedIcon />
                                                </IconButton>
                                            </Link>
                                        </Stack>
                                    </Stack>
                                </Stack>

                                <Stack>
                                    <Stack
                                        sx={{
                                            borderRadius: 3,
                                            p: 2,
                                            background: (theme) =>
                                                theme.colors.blue,
                                        }}
                                        direction="row"
                                    >
                                        <Stack
                                            spacing={0.5}
                                            sx={{ width: "100%" }}
                                        >
                                            <CustomInput
                                                type="number"
                                                value={currencys[0].typeInput}
                                                onChange={(e) =>
                                                    handleCalc(
                                                        0,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={"0"}
                                            />
                                            {prices[currencys[0].name] ? (
                                                <Typography
                                                    sx={{
                                                        color: (theme) =>
                                                            theme.colors.white,
                                                    }}
                                                    fontSize={12}
                                                >
                                                    $
                                                    {Number(
                                                        prices[
                                                            currencys[0].name
                                                        ]
                                                    ).toFixed(2)}
                                                </Typography>
                                            ) : (
                                                <Skeleton
                                                    width={30}
                                                    height={18}
                                                    variant="text"
                                                    sx={{
                                                        background: (theme) =>
                                                            theme.colors
                                                                .input_hover,
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                        <Stack
                                            sx={{ width: "40%" }}
                                            alignItems="end"
                                            justifyContent="space-between"
                                        >
                                            <Button
                                                sx={{
                                                    borderRadius: 10,
                                                    fontWeight: "bold",
                                                    width: "fit-content",
                                                    px: 1.5,
                                                    color: (theme) =>
                                                        theme.colors.blue,
                                                    background: (theme) =>
                                                        theme.colors.white,
                                                    "& svg": {
                                                        fontSize:
                                                            "15px !important",
                                                    },
                                                }}
                                                startIcon={
                                                    <img
                                                        src={displayIcon(
                                                            currencys[0].name
                                                        )}
                                                        width="25"
                                                        alt="ICON"
                                                    />
                                                }
                                                endIcon={
                                                    <ArrowForwardIosIcon />
                                                }
                                            >
                                                {displayName(currencys[0].name)}
                                            </Button>
                                            {account && (
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    justifyContent="end"
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: (theme) =>
                                                                theme.colors
                                                                    .white,
                                                        }}
                                                        fontSize={12}
                                                    >
                                                        balance:
                                                    </Typography>
                                                    {balances[
                                                        currencys[0].name
                                                    ] ? (
                                                        <Typography
                                                            sx={{
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    theme.colors
                                                                        .white,
                                                            }}
                                                            fontSize={12}
                                                        >
                                                            &nbsp;
                                                            {toInt(
                                                                balances[
                                                                    currencys[0]
                                                                        .name
                                                                ],
                                                                3
                                                            )}
                                                        </Typography>
                                                    ) : (
                                                        <Skeleton
                                                            width={50}
                                                            height={18}
                                                            variant="text"
                                                            sx={{
                                                                background: (
                                                                    theme
                                                                ) =>
                                                                    theme.colors
                                                                        .input_hover,
                                                            }}
                                                        />
                                                    )}
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Stack>

                                    <Stack
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <IconButton
                                            onClick={handleConvertCurrency}
                                            sx={{
                                                my: -1.3,
                                                background: (theme) =>
                                                    theme.colors.white,
                                                "& svg": {
                                                    color: (theme) =>
                                                        theme.colors.blue,
                                                },
                                                "&:hover": {
                                                    background:
                                                        "white !important",
                                                },
                                            }}
                                        >
                                            <SwapVertIcon />
                                        </IconButton>
                                    </Stack>

                                    <Stack
                                        sx={{
                                            borderRadius: 3,
                                            p: 2,
                                            background: (theme) =>
                                                theme.colors.blue,
                                        }}
                                        direction="row"
                                    >
                                        <Stack
                                            spacing={0.5}
                                            sx={{ width: "100%" }}
                                        >
                                            <CustomInput
                                                type="number"
                                                value={currencys[1].typeInput}
                                                onChange={(e) =>
                                                    handleCalc(
                                                        1,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={"0"}
                                            />
                                            {prices[currencys[1].name] ? (
                                                <Typography
                                                    sx={{
                                                        color: (theme) =>
                                                            theme.colors.white,
                                                    }}
                                                    fontSize={12}
                                                >
                                                    $
                                                    {Number(
                                                        prices[
                                                            currencys[1].name
                                                        ]
                                                    ).toFixed(2)}
                                                </Typography>
                                            ) : (
                                                <Skeleton
                                                    width={30}
                                                    height={18}
                                                    variant="text"
                                                    sx={{
                                                        background: (theme) =>
                                                            theme.colors
                                                                .input_hover,
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                        <Stack
                                            sx={{ width: "40%" }}
                                            alignItems="end"
                                            justifyContent="space-between"
                                        >
                                            <Button
                                                sx={{
                                                    borderRadius: 10,
                                                    fontWeight: "bold",
                                                    width: "fit-content",
                                                    px: 1.5,
                                                    background: (theme) =>
                                                        theme.colors.white,
                                                    color: (theme) =>
                                                        theme.colors.blue,
                                                    "& svg": {
                                                        fontSize:
                                                            "15px !important",
                                                    },
                                                }}
                                                startIcon={
                                                    <img
                                                        src={displayIcon(
                                                            currencys[1].name
                                                        )}
                                                        width="25"
                                                        alt="ICON"
                                                    />
                                                }
                                                endIcon={
                                                    <ArrowForwardIosIcon />
                                                }
                                            >
                                                {displayName(currencys[1].name)}
                                            </Button>
                                            {account && (
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    justifyContent="end"
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: (theme) =>
                                                                theme.colors
                                                                    .white,
                                                        }}
                                                        fontSize={12}
                                                    >
                                                        balance:
                                                    </Typography>
                                                    {balances[
                                                        currencys[1].name
                                                    ] ? (
                                                        <Typography
                                                            sx={{
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    theme.colors
                                                                        .white,
                                                            }}
                                                            fontSize={12}
                                                        >
                                                            &nbsp;
                                                            {toInt(
                                                                balances[
                                                                    currencys[1]
                                                                        .name
                                                                ],
                                                                3
                                                            )}
                                                        </Typography>
                                                    ) : (
                                                        <Skeleton
                                                            width={50}
                                                            height={18}
                                                            variant="text"
                                                            sx={{
                                                                background: (
                                                                    theme
                                                                ) =>
                                                                    theme.colors
                                                                        .input_hover,
                                                            }}
                                                        />
                                                    )}
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Stack>

                                {warning && (
                                    <Stack
                                        sx={{
                                            border: (theme) =>
                                                `1px solid ${theme.colors.red}`,
                                            borderRadius: 3,
                                            p: 2,
                                            background: "#f2464614",
                                            color: (theme) => theme.colors.red,
                                        }}
                                        spacing={2}
                                        direction="row"
                                    >
                                        <ErrorOutlineIcon />
                                        <Typography
                                            component={"span"}
                                            fontSize={14}
                                        >
                                            Price Impact Too Hight.
                                            <Typography
                                                sx={{
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    handleCalc(
                                                        warning == "0" ? 1 : 0,
                                                        String(
                                                            toInt(
                                                                calcDecimal(
                                                                    balances[
                                                                        currencys[
                                                                            warning ==
                                                                            "0"
                                                                                ? 1
                                                                                : 0
                                                                        ].name
                                                                    ]
                                                                )
                                                            )
                                                        )
                                                    )
                                                }
                                                component={"span"}
                                                fontWeight={600}
                                                fontSize={14}
                                            >
                                                Reduce amount of{" "}
                                                {displayName(
                                                    currencys[Number(warning)]
                                                        .name
                                                )}{" "}
                                                to maximum limit
                                            </Typography>
                                        </Typography>
                                    </Stack>
                                )}

                                <Stack>
                                    {(() => {
                                        switch (allowance.status) {
                                            case "amount":
                                                return (
                                                    <Button
                                                        disabled={true}
                                                        sx={{
                                                            background: (
                                                                theme
                                                            ) =>
                                                                theme.colors
                                                                    .blue,
                                                            borderRadius: 10,
                                                            height: 45,
                                                            color: (theme) =>
                                                                `${theme.colors.inputs} !important`,
                                                            "&:hover": {
                                                                background: (
                                                                    theme
                                                                ) =>
                                                                    theme.colors
                                                                        .blue,
                                                            },
                                                        }}
                                                    >
                                                        Add liquidity
                                                    </Button>
                                                );
                                            case "balance":
                                                return (
                                                    <Button
                                                        disabled={true}
                                                        sx={{
                                                            background: (
                                                                theme
                                                            ) =>
                                                                theme.colors
                                                                    .blue,
                                                            borderRadius: 10,
                                                            height: 45,
                                                            color: (theme) =>
                                                                `${theme.colors.inputs} !important`,
                                                            "&:hover": {
                                                                background: (
                                                                    theme
                                                                ) =>
                                                                    theme.colors
                                                                        .blue,
                                                            },
                                                        }}
                                                    >
                                                        Balance is not enough
                                                    </Button>
                                                );
                                            case "approve":
                                                return (
                                                    <Button
                                                        sx={{
                                                            background: (
                                                                theme
                                                            ) =>
                                                                theme.colors
                                                                    .blue,
                                                            borderRadius: 10,
                                                            height: 45,
                                                            color: (theme) =>
                                                                `${theme.colors.inputs} !important`,
                                                            "&:hover": {
                                                                background: (
                                                                    theme
                                                                ) =>
                                                                    theme.colors
                                                                        .blue,
                                                            },
                                                        }}
                                                        disabled={
                                                            account
                                                                ? false
                                                                : true
                                                        }
                                                        onClick={() =>
                                                            haldneApprove(
                                                                currencys[
                                                                    allowance
                                                                        .currency
                                                                ].name
                                                            )
                                                        }
                                                    >
                                                        {account
                                                            ? `Approve ${
                                                                  currencys[
                                                                      allowance
                                                                          .currency
                                                                  ].name
                                                              }`
                                                            : "Connect Wallet"}
                                                    </Button>
                                                );
                                            default:
                                                return (
                                                    <Button
                                                        onClick={
                                                            handleAddLiquidity
                                                        }
                                                        disabled={
                                                            !currencys[0]
                                                                .typeInput ||
                                                            !currencys[1]
                                                                .typeInput
                                                        }
                                                        sx={{
                                                            background: (
                                                                theme
                                                            ) =>
                                                                theme.colors
                                                                    .blue,
                                                            borderRadius: 10,
                                                            height: 45,
                                                            color: (theme) =>
                                                                `${theme.colors.inputs} !important`,
                                                            "&:hover": {
                                                                background: (
                                                                    theme
                                                                ) =>
                                                                    theme.colors
                                                                        .blue,
                                                            },
                                                        }}
                                                    >
                                                        Add liquidity
                                                    </Button>
                                                );
                                        }
                                    })()}
                                </Stack>
                            </Stack>
                        </Stack>

                        <Stack
                            sx={{
                                width: "100%",
                                pb: theme.isMobile ? 6 : 10,
                            }}
                        >
                            <Stack
                                justifycontent="center"
                                alignItems="center"
                                spacing={theme.isMobile ? 1 : 3}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 28,
                                        color: (theme) => theme.colors.red,
                                    }}
                                >
                                    TOTAL LUNC BURNED
                                </Typography>
                                {burned ? (
                                    <Typography
                                        sx={{
                                            fontSize: 24,
                                            color: (theme) => theme.colors.red,
                                        }}
                                    >
                                        {toInt(burned, 2)}
                                    </Typography>
                                ) : (
                                    <Skeleton
                                        width={50}
                                        height={36}
                                        sx={{
                                            background: (theme) =>
                                                theme.colors.input_hover,
                                        }}
                                    />
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default Liquidity;
