import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";
import { ETH_MAINNET, MAINNET } from "../config";
import { MultiChainProvider } from "../context/multichain";

const httpProvider = {
    [MAINNET]: new Web3.providers.HttpProvider(
        "https://bsc-dataseed.binance.org/",
        {
            timeout: 10000,
        }
    ),
    [ETH_MAINNET]: new Web3.providers.HttpProvider(
        "https://mainnet.infura.io/v3/15d41824e3f64dd1a0ee0c94ff77abc8",
        {
            timeout: 10000,
        }
    ),
};

/**
 * Provides a web3 instance using the provider provided by useWallet
 * with a fallback of an httpProver
 * Recreate web3 instance only if the ethereum provider change
 */
const useWeb3 = () => {
    const { library, active, chainId } = useWeb3React();
    const { currentNet, setCurrentNet } = useContext(MultiChainProvider);

    useEffect(() => {
        if (chainId && chainId != currentNet) {
            // setCurrentNet(chainId);
            localStorage.setItem("chain", chainId);
            window.location.reload();
        }
    }, [currentNet, chainId]);

    const [web3, setweb3] = useState(
        new Web3(active ? library.provider : httpProvider[currentNet])
    );

    useEffect(() => {
        if (library && active) {
            setweb3(new Web3(library.provider));
        }
    }, [library, active]);

    return web3;
};

export default useWeb3;
