import React, { useContext, useEffect, useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { Link } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";

import { toEth, toInt } from "../hooks/hook";
import useAccount from "../hooks/useAccount";
import { chainMainToken, CONTRACTS, MAINNET, TOKEN } from "../config";
import useLiquidity from "../hooks/useLiquidity";
import { ThemeConfig } from "../context/index";
import { CustomInput } from "../components/CustomComponent";
import { MultiChainProvider } from "../context/multichain";
import LUNCICON from "../assets/img/lunc.png";
import BUSDICON from "../assets/img/busd.png";
import USDTICON from "../assets/img/usdt.png";

const Home = () => {
    const { currentNet } = useContext(MultiChainProvider);
    const { account } = useWeb3React();
    const { Slippage } = useContext(ThemeConfig);

    const [fees, setFees] = useState({});
    const [prices, setPrices] = useState({});
    const [burned, setBurned] = useState();
    const [expanded, setExpanded] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [approved, setApproved] = useState({
        LUNC: 0,
        [TOKEN]: 0,
    });
    const [balances, setBalances] = useState({});
    const [initialPrice, setInitialPrice] = useState({
        LUNC: 0,
        [TOKEN]: 0,
    });

    const displayName = (name) =>
        name === TOKEN ? chainMainToken(currentNet) : name;
    const displayIcon = (name) =>
        name !== TOKEN
            ? LUNCICON
            : chainMainToken(currentNet) === "BUSD"
            ? BUSDICON
            : USDTICON;

    const { getAmountsOut, getAmountsIn, onSwap, getFees, getBurnedAmount } =
        useLiquidity(currentNet);
    const {
        getBalance,
        getAllowance,
        onApproveLunc,
        onApproveBusd,
        fetchTokenPrices,
    } = useAccount(currentNet);

    const [currencys, setCurrencys] = useState([
        {
            address: CONTRACTS[currentNet].LUNC.address,
            name: CONTRACTS[currentNet].LUNC.symbol,
            typeInput: 0,
        },
        {
            address: CONTRACTS[currentNet][TOKEN].address,
            name: CONTRACTS[MAINNET][TOKEN].symbol,
            typeInput: 0,
        },
    ]);

    const allowance = useMemo(() => {
        if (!currencys[0].typeInput) {
            return { status: "amount", title: "Input correct amount" };
        }

        if (
            Number(toEth(currencys[0].typeInput)) >
            Number(balances[currencys[0].name])
        ) {
            return { status: "balance", currency: 0 };
        }

        if (
            Number(toEth(currencys[0].typeInput)) >
            Number(approved[currencys[0].name])
        ) {
            return { status: "approve", currency: 0 };
        }

        return { status: true };
    }, [approved, currencys, balances]);

    const haldneApprove = async (currency) => {
        if (currency == "LUNC") {
            await onApproveLunc(currentNet);
        } else {
            await onApproveBusd(currentNet);
        }
        const allowed = await getAllowance(currentNet);
        setApproved(allowed);
    };

    const handleConvertCurrency = async () => {
        const res = await getAmountsOut(
            1,
            [currencys[1].address, currencys[0].address],
            currentNet
        );
        let cur = {};
        cur[currencys[1].name] = res[0];
        cur[currencys[0].name] = res[1];
        setInitialPrice(cur);

        setCurrencys((prev) => {
            const temp = [prev[1], prev[0]];
            return [...temp];
        });

        const list = currencys.map((item, index) => ({ ...item, index }));
        const selectedCur = list.find((item) => item.name == selectedCurrency);

        if (selectedCur) {
            let res1 = 0;
            if (selectedCur.index == 1) {
                res1 = await getAmountsOut(
                    selectedCur.typeInput,
                    [currencys[1].address, currencys[0].address],
                    currentNet
                );
            } else {
                res1 = await getAmountsIn(
                    selectedCur.typeInput,
                    [currencys[1].address, currencys[0].address],
                    currentNet
                );
            }

            setCurrencys((prev) => {
                prev[selectedCur.index].typeInput = toInt(
                    calcDecimal(res1[selectedCur.index])
                );
                return [...prev];
            });
        }
    };

    const handleCalc = async (i, value) => {
        setSelectedCurrency(currencys[i].name);
        setCurrencys((prev) => {
            prev[i].typeInput = value;
            return [...prev];
        });

        if (!value || value == 0) {
            return setCurrencys((prev) => {
                prev[i === 0 ? 1 : 0].typeInput = 0;
                return [...prev];
            });
        }

        let path = [];

        path = currencys.map((cur) => cur.address);

        let res = 0;
        if (i == 0) {
            res = await getAmountsOut(value, path, currentNet);
        } else {
            res = await getAmountsIn(value, path, currentNet);
        }

        setCurrencys((prev) => {
            prev[i == 0 ? 1 : 0].typeInput = toInt(
                calcDecimal(res[i == 0 ? 1 : 0])
            );
            return [...prev];
        });
    };

    const calcDecimal = (val) => {
        if (!val || val == "0") return 0;
        const calcedVal =
            val.length > 24
                ? val.slice(0, -18) + "0".repeat(18)
                : val.slice(0, 6) + "0".repeat(val.length - 6);
        return calcedVal;
    };

    const handleAddLiquidity = async () => {
        const path = currencys.map((cur) => cur.address);
        await onSwap(currencys[0].typeInput, path);
        const balances = await getBalance(currentNet);
        setBalances(balances);
    };

    useEffect(() => {
        (async () => {
            if (account) {
                const balances = await getBalance(currentNet);
                setBalances(balances);
                const allowed = await getAllowance(currentNet);
                setApproved(allowed);
            } else {
                setBalances({});
                setApproved({
                    LUNC: 0,
                    [TOKEN]: 0,
                });
            }
            const path = currencys.map((cur) => cur.address);
            const res = await getAmountsOut(1, path);
            setInitialPrice({ LUNC: res[0], [TOKEN]: res[1] });
            const fee = await getFees();
            setFees(fee);
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
                        boxShadow: "0px 2px 24px 0px #a3b4c9",
                        borderRadius: 3,
                        p: 3,
                        background: "rgb(255,255,255)",
                        width: (theme) => (theme.isMobile ? "100%" : "450px"),
                    }}
                    spacing={2}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent={"space-between"}
                    >
                        <Stack direction="row" spacing={2}>
                            <Button
                                disableRipple
                                sx={{
                                    padding: 0,
                                    background: "transparent",
                                    fontWeight: "bold",
                                    color: "black",
                                    "&:hover": {
                                        background: "transparent",
                                        color: (theme) => theme.colors.black,
                                    },
                                }}
                            >
                                Swap
                            </Button>
                            <Link
                                to={"/liquidity"}
                                style={{ textDecoration: "none" }}
                            >
                                <Button
                                    disableRipple
                                    sx={{
                                        padding: 0,
                                        background: "transparent",
                                        fontWeight: "bold",
                                        "&:hover": {
                                            background: "transparent",
                                            color: (theme) =>
                                                theme.colors.black,
                                        },
                                    }}
                                >
                                    Add Liquidity
                                </Button>
                            </Link>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography fontSize={13}>
                                Slippage: {Slippage}%
                            </Typography>
                            <Stack direction="row">
                                <Link
                                    to={"/setting"}
                                    style={{ textDecoration: "none" }}
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
                                background: (theme) => theme.colors.blue,
                            }}
                            direction="row"
                        >
                            <Stack spacing={0.5} sx={{ width: "70%" }}>
                                <CustomInput
                                    type="number"
                                    value={currencys[0].typeInput}
                                    onChange={(e) =>
                                        handleCalc(0, e.target.value)
                                    }
                                    placeholder={"0"}
                                />
                                {prices[currencys[0].name] ? (
                                    <Typography
                                        sx={{ color: "white" }}
                                        fontSize={12}
                                    >
                                        $
                                        {Number(
                                            prices[currencys[0].name]
                                        ).toFixed(2)}
                                    </Typography>
                                ) : (
                                    <Skeleton
                                        width={30}
                                        height={18}
                                        variant="text"
                                        sx={{
                                            background: (theme) =>
                                                theme.colors.input_hover,
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
                                        color: (theme) => theme.colors.blue,
                                        background: "white",
                                        "& svg": {
                                            fontSize: "15px !important",
                                        },
                                        "&:hover": {
                                            background: "white !important",
                                        },
                                    }}
                                    startIcon={
                                        <img
                                            src={displayIcon(currencys[0].name)}
                                            width="25"
                                            alt="ICON"
                                        />
                                    }
                                    endIcon={<ArrowForwardIosIcon />}
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
                                            sx={{ color: "white" }}
                                            fontSize={12}
                                        >
                                            balance:
                                        </Typography>
                                        {balances[currencys[0].name] ? (
                                            <Typography
                                                sx={{ color: "white" }}
                                                fontSize={12}
                                            >
                                                &nbsp;
                                                {toInt(
                                                    balances[currencys[0].name],
                                                    3
                                                )}
                                            </Typography>
                                        ) : (
                                            <Skeleton
                                                width={50}
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
                                )}
                            </Stack>
                        </Stack>

                        <Stack alignItems="center" justifyContent="center">
                            <IconButton
                                onClick={handleConvertCurrency}
                                sx={{
                                    my: -1.3,
                                    background: "white",
                                    "& svg": {
                                        color: (theme) => theme.colors.blue,
                                    },
                                    "&:hover": {
                                        background: "white !important",
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
                                background: (theme) => theme.colors.blue,
                            }}
                            direction="row"
                        >
                            <Stack spacing={0.5} sx={{ width: "70%" }}>
                                <CustomInput
                                    type="number"
                                    value={currencys[1].typeInput}
                                    onChange={(e) =>
                                        handleCalc(1, e.target.value)
                                    }
                                    placeholder={"0"}
                                />
                                {prices[currencys[1].name] ? (
                                    <Typography
                                        sx={{ color: "white" }}
                                        fontSize={12}
                                    >
                                        $
                                        {Number(
                                            prices[currencys[1].name]
                                        ).toFixed(2)}
                                    </Typography>
                                ) : (
                                    <Skeleton
                                        width={30}
                                        height={18}
                                        variant="text"
                                        sx={{
                                            background: (theme) =>
                                                theme.colors.input_hover,
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
                                        color: (theme) => theme.colors.blue,
                                        background: (theme) =>
                                            theme.colors.white,
                                        "& svg": {
                                            fontSize: "15px !important",
                                        },
                                        "&:hover": {
                                            background: "white !important",
                                        },
                                    }}
                                    startIcon={
                                        <img
                                            src={displayIcon(currencys[1].name)}
                                            width="25"
                                            alt="ICON"
                                        />
                                    }
                                    endIcon={<ArrowForwardIosIcon />}
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
                                                    theme.colors.white,
                                            }}
                                            fontSize={12}
                                        >
                                            balance:
                                        </Typography>
                                        {balances[currencys[1].name] ? (
                                            <Typography
                                                sx={{
                                                    color: (theme) =>
                                                        theme.colors.white,
                                                }}
                                                fontSize={12}
                                            >
                                                &nbsp;
                                                {toInt(
                                                    balances[currencys[1].name],
                                                    3
                                                )}
                                            </Typography>
                                        ) : (
                                            <Skeleton
                                                width={50}
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
                                )}
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                sx={{
                                    "& svg": {
                                        color: (theme) => theme.colors.text2,
                                    },
                                }}
                            >
                                <ErrorOutlineIcon fontSize="small" />
                                <Typography
                                    sx={{
                                        color: "black",
                                        fontWeight: "bold",
                                        fontSize: 12,
                                    }}
                                >
                                    {`${toInt(
                                        initialPrice[currencys[0].name],
                                        0
                                    )} ${displayName(currencys[0].name)}`}{" "}
                                    ={" "}
                                    {`${toInt(
                                        calcDecimal(
                                            initialPrice[currencys[1].name]
                                        )
                                    )} ${displayName(currencys[1].name)}`}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                sx={{
                                    "& svg": {
                                        color: (theme) => theme.colors.red,
                                    },
                                }}
                            >
                                <LocalFireDepartmentIcon fontSize="small" />
                                {fees.burnFee ? (
                                    <Typography
                                        sx={{
                                            color: (theme) =>
                                                theme.colors.text2,
                                            fontSize: 12,
                                        }}
                                    >
                                        {fees.burnFee / 100}%
                                    </Typography>
                                ) : (
                                    <Skeleton
                                        width={30}
                                        height={18}
                                        variant="text"
                                        sx={{
                                            background: (theme) =>
                                                theme.colors.input_hover,
                                        }}
                                    />
                                )}
                                <IconButton
                                    sx={{
                                        padding: 0,
                                        "& svg": {
                                            color: (theme) =>
                                                theme.colors.text2,
                                            transform: `rotate(${
                                                expanded ? 180 : 0
                                            }deg)`,
                                            transition: "0.3s",
                                        },
                                    }}
                                    onClick={() => setExpanded(!expanded)}
                                >
                                    <ExpandMoreIcon />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Stack>

                    <Accordion
                        disableGutters
                        expanded={expanded}
                        sx={{
                            background: "transparent",
                            boxShadow: "none",
                            "& > div": {
                                p: 0,
                            },
                            "& .MuiAccordionDetails-root": {
                                p: 0,
                            },
                            "&::before": {
                                display: "none",
                            },
                        }}
                    >
                        <AccordionSummary
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            sx={{
                                display: "none",
                            }}
                        ></AccordionSummary>
                        <AccordionDetails id="panel1a-content">
                            <Stack
                                sx={{
                                    border: (theme) =>
                                        `2px solid ${theme.colors.elements}`,
                                    borderRadius: 3,
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            color: (theme) =>
                                                theme.colors.text2,
                                        }}
                                    >
                                        Expected OutPut
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.5}
                                        sx={{
                                            my: 1.5,
                                            "& svg": {
                                                color: (theme) =>
                                                    theme.colors.text2,
                                            },
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: 12,
                                                fontWeight: "bold",
                                                color: "black",
                                            }}
                                        >
                                            {`${Number(
                                                currencys[1].typeInput
                                            )} ${currencys[1].name}`}
                                        </Typography>
                                        <ErrorOutlineIcon fontSize="small" />
                                    </Stack>
                                </Stack>

                                <Divider />

                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            color: (theme) =>
                                                theme.colors.text2,
                                        }}
                                    >
                                        Minimum received after slippage (
                                        {Slippage}%)
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.5}
                                        sx={{
                                            my: 1.5,
                                            "& svg": {
                                                color: (theme) =>
                                                    theme.colors.text2,
                                            },
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: 12,
                                                fontWeight: "bold",
                                                color: "black",
                                            }}
                                        >
                                            {`${(
                                                currencys[1].typeInput -
                                                (currencys[1].typeInput *
                                                    Slippage) /
                                                    100
                                            ).toFixed(4)} ${currencys[1].name}`}
                                        </Typography>
                                        <ErrorOutlineIcon fontSize="small" />
                                    </Stack>
                                </Stack>

                                <Divider />

                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            color: (theme) =>
                                                theme.colors.text2,
                                        }}
                                    >
                                        Total Burned Amount
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.5}
                                        sx={{
                                            my: 1.5,
                                            "& svg": {
                                                color: (theme) =>
                                                    theme.colors.text2,
                                            },
                                        }}
                                    >
                                        {burned ? (
                                            <Typography
                                                sx={{
                                                    fontSize: 12,
                                                    fontWeight: "bold",
                                                    color: "black",
                                                }}
                                            >
                                                {toInt(burned, 2)}
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
                                        <ErrorOutlineIcon fontSize="small" />
                                    </Stack>
                                </Stack>

                                <Divider />

                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            color: (theme) =>
                                                theme.colors.text2,
                                        }}
                                    >
                                        Burn Fee
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.5}
                                        sx={{
                                            my: 1.5,
                                            "& svg": {
                                                color: (theme) =>
                                                    theme.colors.text2,
                                            },
                                        }}
                                    >
                                        {fees.burnFee ? (
                                            <Typography
                                                sx={{
                                                    fontSize: 12,
                                                    fontWeight: "bold",
                                                    color: "black",
                                                }}
                                            >
                                                {fees.burnFee / 100}%
                                            </Typography>
                                        ) : (
                                            <Skeleton
                                                width={90}
                                                height={18}
                                                variant="text"
                                                sx={{
                                                    background: (theme) =>
                                                        theme.colors
                                                            .input_hover,
                                                }}
                                            />
                                        )}
                                        <ErrorOutlineIcon fontSize="small" />
                                    </Stack>
                                </Stack>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    <Stack>
                        {(() => {
                            switch (allowance.status) {
                                case "amount":
                                    return (
                                        <Button
                                            disabled={true}
                                            sx={{
                                                background: (theme) =>
                                                    theme.colors.blue,
                                                borderRadius: 10,
                                                height: 45,
                                                color: (theme) =>
                                                    `${theme.colors.inputs} !important`,
                                                "&:hover": {
                                                    background: (theme) =>
                                                        theme.colors.black,
                                                },
                                            }}
                                        >
                                            Swap
                                        </Button>
                                    );
                                case "balance":
                                    return (
                                        <Button
                                            disabled={true}
                                            sx={{
                                                background: (theme) =>
                                                    theme.colors.blue,
                                                borderRadius: 10,
                                                height: 45,
                                                color: (theme) =>
                                                    `${theme.colors.inputs} !important`,
                                                "&:hover": {
                                                    background: (theme) =>
                                                        theme.colors.blue,
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
                                                background: (theme) =>
                                                    theme.colors.blue,
                                                borderRadius: 10,
                                                height: 45,
                                                color: (theme) =>
                                                    `${theme.colors.inputs} !important`,
                                                "&:hover": {
                                                    background: (theme) =>
                                                        theme.colors.blue,
                                                },
                                            }}
                                            disabled={account ? false : true}
                                            onClick={() =>
                                                haldneApprove(
                                                    currencys[
                                                        allowance.currency
                                                    ].name
                                                )
                                            }
                                        >
                                            {account
                                                ? `Approve ${
                                                      currencys[
                                                          allowance.currency
                                                      ].name
                                                  }`
                                                : "Connect Wallet"}
                                        </Button>
                                    );
                                default:
                                    return (
                                        <Button
                                            onClick={handleAddLiquidity}
                                            disabled={
                                                !currencys[0].typeInput ||
                                                !currencys[1].typeInput
                                            }
                                            sx={{
                                                background: (theme) =>
                                                    theme.colors.blue,
                                                borderRadius: 10,
                                                height: 45,
                                                color: (theme) =>
                                                    `${theme.colors.inputs} !important`,
                                                "&:hover": {
                                                    background: (theme) =>
                                                        theme.colors.blue,
                                                },
                                            }}
                                        >
                                            Swap
                                        </Button>
                                    );
                            }
                        })()}
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default Home;
