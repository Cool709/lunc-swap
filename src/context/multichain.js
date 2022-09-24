/* eslint-disable react/display-name */
import React, { useState } from "react";
import { MAINNET, ETH_MAINNET } from "../config";

export const MultiChainProvider = React.createContext(null);

export default ({ children }) => {
    const chainType = [ETH_MAINNET, MAINNET];
    const chain = Number(localStorage.getItem("chain"));
    const [currentNet, setCurrentNet] = useState(chain || MAINNET);

    const store = {
        chainType,
        currentNet,
        setCurrentNet,
    };

    return (
        <MultiChainProvider.Provider value={store}>
            {children}
        </MultiChainProvider.Provider>
    );
};
