import BigNumber from "bignumber.js";
import { parseUnits } from "@ethersproject/units";
import { JSBI, TokenAmount } from "@pancakeswap/sdk";
import { JSBI as JSBI1, TokenAmount as TokenAmount1 } from "@uniswap/sdk";
import { MAINNET } from "../config";

export const toEth = (_amount, decimal = 18) => {
    return new BigNumber(_amount)
        .times(new BigNumber(10).pow(decimal))
        .toString();
};

export const toInt = (_amount, fix, decimal = 18) => {
    let num = new BigNumber(_amount)
        .div(new BigNumber(10).pow(decimal))
        .toNumber();

    if (fix) {
        num = num
            .toFixed(fix + 1)
            .toString()
            .slice(0, -1);
    }

    if (num[num.length - 1] == ".") return num.slice(0, num.length - 1);
    return Number(num);
};

export const tryParseAmount = (value, currency, chainId = MAINNET) => {
    if (!value || !currency) {
        return undefined;
    }
    try {
        const typedValueParsed = parseUnits(
            value,
            currency.decimals
        ).toString();

        if (value !== "0") {
            return chainId == MAINNET
                ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
                : new TokenAmount1(currency, JSBI1.BigInt(typedValueParsed));
        }
    } catch (error) {
        // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
        console.debug(`Failed to parse input amount: "${value}"`, error);
    }
    // necessary for all paths to return a value
    return undefined;
};
