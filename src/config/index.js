import BigNumber from "bignumber.js";

BigNumber.config({
    EXPONENTIAL_AT: 1000,
    DECIMAL_PLACES: 80,
});

export const TESTNET = 97;
export const MAINNET = 56;
export const ETH_MAINNET = 1;

export const SlippageList = [0.5, 1, 3];
export const TxFeeList = [
    {
        title: "Normal",
        value: "5000000000",
    },
    {
        title: "Fast",
        value: "6000000000",
    },
    {
        title: "Instant",
        value: "7000000000",
    },
];

export const BURN_ADDR = "0x000000000000000000000000000000000000dEaD";
export const TOKEN = "TOKEN";

export const CONTRACTS = {
    [TESTNET]: {
        ROUTER: {
            address: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
            abi: require("./abis/pancake.json"),
        },
        SWAP: {
            address: "0x00a4d13A4f92Ccf0E648B2B7Faddb4bf3C3e9697",
            abi: require("./abis/swap-test.json"),
        },
        LUNC: {
            address: "0x38f1D732fec7ea0882368bBB14bc098C7b9f88b3",
            abi: require("./abis/erc20.json"),
            name: "LUNC",
        },
        [TOKEN]: {
            address: "0x8EE2A5B76448C06A52CA0782600d6E9F8DD74f8E",
            abi: require("./abis/erc20.json"),
            name: TOKEN,
        },
    },
    [MAINNET]: {
        ROUTER: {
            address: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
            abi: require("./abis/pancake.json"),
        },
        SWAP: {
            address: "0x5D39952AAC6DB93c973CC67B474b09cdE58Ef22F",
            abi: require("./abis/swap.json"),
        },
        LUNC: {
            address: "0xECCF35F941Ab67FfcAA9A1265C2fF88865caA005",
            chainId: 56,
            decimals: 18,
            abi: require("./abis/erc20.json"),
            symbol: "LUNC",
            name: "LUNC Token",
        },
        [TOKEN]: {
            address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            abi: require("./abis/erc20.json"),
            symbol: TOKEN,
            chainId: 56,
            decimals: 18,
            name: "BUSD Token",
        },
        PAIR: {
            address: "0xfA3654f68C1E303b7A1ebf880a54f092fB8B87Cf",
            abi: require("./abis/IpancakeLp.json"),
            symbol: "LP",
        },
    },
    [ETH_MAINNET]: {
        ROUTER: {
            address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            abi: require("./abis/uniswap.json"),
        },
        SWAP: {
            address: "0x2b8f135fb761542b21103e018c75E0C0c797399E",
            abi: require("./abis/eth_swap.json"),
        },
        LUNC: {
            address: "0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9",
            chainId: 1,
            decimals: 18,
            abi: require("./abis/erc20.json"),
            symbol: "LUNC",
            name: "LUNC Token",
        },
        [TOKEN]: {
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            abi: require("./abis/erc20.json"),
            symbol: TOKEN,
            chainId: 1,
            decimals: 18,
            name: "USDT Token",
        },
        PAIR: {
            address: "0x67B3825348521B94828127f1eE31da80EE67d285",
            abi: require("./abis/IuniswapLp.json"),
            symbol: "LP",
        },
    },
};

export const chainName = (chainId) =>
    chainId === MAINNET ? "Binance Smart Chain" : "Ethereum Mainnet";
export const chainNativeToken = (chainId) =>
    chainId === MAINNET ? "BNB" : "ETH";
export const chainMainToken = (chainId) =>
    chainId === MAINNET ? "BUSD" : "USDT";
export const chainExplorerUrl = (chainId) =>
    chainId === MAINNET ? "https://bscscan.com" : "https://etherscan.io";
