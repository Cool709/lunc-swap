import { InjectedConnector } from "@web3-react/injected-connector";
import { MAINNET, ETH_MAINNET } from "../config";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const POLLING_INTERVAL = 12000;
// const RPC_URL = "https://bsc-dataseed.binance.org/";
export const RPC_URL = {
    [MAINNET]: "https://bsc-dataseed.binance.org/",
    [ETH_MAINNET]:
        "https://mainnet.infura.io/v3/15d41824e3f64dd1a0ee0c94ff77abc8",
};

export const injected = new InjectedConnector({
    supportedChainIds: [56, 1],
});

// export const walletconnect = new WalletConnectConnector({
//     rpc: { 56: RPC_URL, 1: "https://mainnet.infura.io/v3/" },
//     bridge: "https://bridge.walletconnect.org",
//     qrcode: true,
//     pollingInterval: POLLING_INTERVAL,
// });
