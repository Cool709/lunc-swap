import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";

// ** Import Providers
import MaterialThemeProvider from "./providers/theme";
import MuiSnackbarProvider from "./providers/snackbar";
import NotificationProvider from "./providers/notification";
import Web3Provider from "./providers/web3";

import { ContextProvider } from "./context/index";
import Spinner from "./components/Spinner";
import Multichain from "./context/multichain";

const App = lazy(() => import("./App"));

ReactDOM.render(
    <React.StrictMode>
        <ContextProvider>
            <Multichain>
                <MaterialThemeProvider>
                    <MuiSnackbarProvider>
                        <NotificationProvider>
                            <Web3Provider>
                                <Suspense fallback={<Spinner />}>
                                    <App />
                                </Suspense>
                            </Web3Provider>
                        </NotificationProvider>
                    </MuiSnackbarProvider>
                </MaterialThemeProvider>
            </Multichain>
        </ContextProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
