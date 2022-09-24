import BigNumber from "bignumber.js";
import { useWeb3React } from "@web3-react/core";
import { CONTRACTS, TOKEN, MAINNET } from "../config";
import {
    useTokenContract,
    useLuncContract,
    usePairContract,
} from "./useContract";

const useAccount = (chainId = MAINNET) => {
    const { account } = useWeb3React();

    const LuncContract = useLuncContract(chainId);
    const BusdContract = useTokenContract(chainId);
    const PairContract = usePairContract(chainId);

    const getBalance = async () => {
        if (!account) return;

        const LUNC = await LuncContract.methods.balanceOf(account).call();
        const token = await BusdContract.methods.balanceOf(account).call();

        return {
            LUNC,
            [TOKEN]: token,
        };
    };

    const getAllowance = async (chainId = MAINNET) => {
        if (!account) return;

        const LUNC = await LuncContract.methods
            .allowance(account, CONTRACTS[chainId].SWAP.address)
            .call();
        const token = await BusdContract.methods
            .allowance(account, CONTRACTS[chainId].SWAP.address)
            .call();

        return {
            LUNC,
            [TOKEN]: token,
        };
    };

    const onApproveLunc = async (chainId = MAINNET) => {
        if (!account) return;

        await LuncContract.methods
            .approve(
                CONTRACTS[chainId].SWAP.address,
                new BigNumber("100000000000")
                    .times(new BigNumber(10).pow(18))
                    .toString()
            )
            .send({ from: account });
    };

    const onApproveBusd = async (chainId = MAINNET) => {
        if (!account) return;

        await BusdContract.methods
            .approve(
                CONTRACTS[chainId].SWAP.address,
                new BigNumber("100000000000")
                    .times(new BigNumber(10).pow(18))
                    .toString()
            )
            .send({ from: account });
    };

    const fetchTokenPrices = async (chainId = MAINNET) => {
        let busdPrice = 0;
        let luncPrice = 0;
        if (chainId == MAINNET) {
            try {
                const response = await fetch(
                    `https://api.pancakeswap.info/api/v2/tokens/${CONTRACTS[MAINNET][TOKEN].address}`
                );
                const { data } = await response.json();
                busdPrice = new BigNumber(data.price).toString();
            } catch (error) {
                console.log(error);
            }

            try {
                const response = await fetch(
                    `https://api.pancakeswap.info/api/v2/tokens/${CONTRACTS[MAINNET].LUNC.address}`
                );
                const { data } = await response.json();
                luncPrice = new BigNumber(data.price).toString();
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const result = await PairContract.methods.getReserves().call();
                luncPrice = new BigNumber(
                    new BigNumber(result[1]) / new BigNumber(result[0])
                ).toString();
                busdPrice = 1;
            } catch (error) {
                console.error(error);
            }
        }

        return {
            [TOKEN]: busdPrice,
            LUNC: luncPrice,
        };
    };

    return {
        getAllowance,
        onApproveLunc,
        getBalance,
        onApproveBusd,
        fetchTokenPrices,
    };
};

export default useAccount;
