import React, { useState, createContext } from 'react'
import { TxFeeList } from '../config';

const Slippage = 1;
const txFee = TxFeeList[0];

const ThemeConfig = createContext({
    Slippage: 1,
    txFee: TxFeeList[0],
    setSlippage: () => { },
    setTxFee: () => { },
})

const ContextProvider = ({ children }) => {

    /*eslint-disable */

    const setTxFee = (txFee) => {
        setConfig(prevState => {
            return {
                ...prevState,
                txFee
            }
        })
    }

    const setSlippage = (item) => {

        setConfig(prevState => {
            return {
                ...prevState,
                Slippage: item == '' ? 0 : item
            }
        })
    }

    const modeState = {
        Slippage,
        txFee,
        setSlippage,
        setTxFee,
    }

    const [config, setConfig] = useState(modeState)

    /*eslint-enable */

    return (
        <ThemeConfig.Provider value={config}>
            {children}
        </ThemeConfig.Provider>
    )
}

export { ThemeConfig, ContextProvider }