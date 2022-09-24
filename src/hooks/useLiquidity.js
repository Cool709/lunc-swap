import { useContext } from "react";
import { toEth, tryParseAmount } from "./hook";
import { useWeb3React } from "@web3-react/core";
import { BURN_ADDR, MAINNET } from "../config";
import { ThemeConfig } from "../context";
import {
    useLuncContract,
    usePairContract,
    useRouterContract,
    useSwapContract,
} from "./useContract";
import { Pair, TokenAmount, Token } from "@pancakeswap/sdk";
import {
    Pair as Pair1,
    TokenAmount as TokenAmount1,
    Token as Token1,
} from "@uniswap/sdk";

const useLiquidity = (chainId = MAINNET) => {
    const { account } = useWeb3React();
    const SwapContract = useSwapContract(chainId);
    const LuncContract = useLuncContract(chainId);
    const pairContract = usePairContract(chainId);
    const pancakeContract = useRouterContract(chainId);
    const { txFee } = useContext(ThemeConfig);

    const getBurnedAmount = async () => {
        const res = await LuncContract.methods.balanceOf(BURN_ADDR).call();
        return res;
    };

    const getAmountsOut = async (amountIn, path) => {
        try {
            const res = await pancakeContract.methods
                .getAmountsOut(toEth(amountIn), path)
                .call();
            return res;
        } catch (error) {
            console.log(error);
            return 0;
        }
    };

    const getAmountsIn = async (amountIn, path) => {
        try {
            const res = await pancakeContract.methods
                .getAmountsIn(toEth(amountIn), path)
                .call();
            return res;
        } catch (error) {
            console.log(error);
            return 0;
        }
    };

    const onAddLiquidity = async (
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired
    ) => {
        if (!account) return;

        await SwapContract.methods
            .addLiquidity(
                tokenA,
                tokenB,
                toEth(amountADesired),
                toEth(amountBDesired),
                0,
                0,
                account,
                new Date().getTime() * 10
            )
            .send({ from: account, gasPrice: txFee.value });
    };

    const onSwap = async (amountIn, path) => {
        if (!account) return;
        await SwapContract.methods
            .swapExactTokensForTokens(
                toEth(amountIn),
                0,
                path,
                account,
                new Date().getTime() * 10
            )
            .send({ from: account, gasPrice: txFee.value });
    };

    const getFees = async () => {
        const burnFee = await SwapContract.methods.burnFee().call();
        const profitFee = await SwapContract.methods.profitFee().call();

        return { burnFee, profitFee };
    };

    const getCaluedReserveAmount = async (val, path, chainId = MAINNET) => {
        const reserve = await pairContract.methods.getReserves().call();
        const reserve0 = reserve.reserve0 || reserve._reserve0;
        const reserve1 = reserve.reserve1 || reserve._reserve1;
        const tokenA =
            chainId === MAINNET
                ? new Token(
                      chainId,
                      path[0].address,
                      path[0].decimals,
                      path[0].symbol
                  )
                : new Token1(
                      chainId,
                      path[0].address,
                      path[0].decimals,
                      path[0].symbol
                  );
        const tokenB =
            chainId === MAINNET
                ? new Token(
                      chainId,
                      path[1].address,
                      path[1].decimals,
                      path[1].symbol
                  )
                : new Token1(
                      chainId,
                      path[1].address,
                      path[1].decimals,
                      path[1].symbol
                  );
        const [token0, token1] = tokenA.sortsBefore(tokenB)
            ? [tokenA, tokenB]
            : [tokenB, tokenA];
        const pair =
            chainId === MAINNET
                ? new Pair(
                      chainId === MAINNET
                          ? new TokenAmount(token0, reserve0)
                          : new TokenAmount1(token0, reserve0),
                      chainId === MAINNET
                          ? new TokenAmount(token1, reserve1)
                          : new TokenAmount1(token1, reserve1)
                  )
                : new Pair1(
                      chainId === MAINNET
                          ? new TokenAmount(token0, reserve0)
                          : new TokenAmount1(token0, reserve0),
                      chainId === MAINNET
                          ? new TokenAmount(token1, reserve1)
                          : new TokenAmount1(token1, reserve1)
                  );
        const independentValue = tryParseAmount(val, tokenA);
        const result = pair.priceOf(tokenA).quote(independentValue);
        return result;
    };

    return {
        onSwap,
        getFees,
        getAmountsIn,
        getAmountsOut,
        onAddLiquidity,
        getBurnedAmount,
        getCaluedReserveAmount,
    };
};

export default useLiquidity;
