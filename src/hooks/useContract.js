import { useEffect, useState } from "react";
import useWeb3 from "./useWeb3";
import { CONTRACTS, MAINNET, TOKEN } from "../config/index.js";

const useContract = (abi, address, contractOptions) => {
    const web3 = useWeb3();
    const [contract, setContract] = useState(
        new web3.eth.Contract(abi, address, contractOptions)
    );

    useEffect(() => {
        setContract(new web3.eth.Contract(abi, address, contractOptions));
    }, [abi, address, contractOptions, web3]);

    return contract;
};

/**
 * Helper hooks to get specific contracts (by ABI)
 */

export const useSwapContract = (chainId = MAINNET) => {
    return useContract(
        CONTRACTS[chainId].SWAP.abi,
        CONTRACTS[chainId].SWAP.address
    );
};

export const useRouterContract = (chainId = MAINNET) => {
    return useContract(
        CONTRACTS[chainId].ROUTER.abi,
        CONTRACTS[chainId].ROUTER.address
    );
};

export const useLuncContract = (chainId = MAINNET) => {
    return useContract(
        CONTRACTS[chainId].LUNC.abi,
        CONTRACTS[chainId].LUNC.address
    );
};

export const useTokenContract = (chainId = MAINNET) => {
    return useContract(
        CONTRACTS[chainId][TOKEN].abi,
        CONTRACTS[chainId][TOKEN].address
    );
};

export const usePairContract = (chainId = MAINNET) => {
    return useContract(
        CONTRACTS[chainId].PAIR.abi,
        CONTRACTS[chainId].PAIR.address
    );
};

export default useContract;
