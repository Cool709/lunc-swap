import React, { Suspense, lazy } from "react";
import Spinner from "./components/Spinner";
import Layout from "./components/Layout";

// ** Import Route Providers
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import Header from "./components/Header";

const Home = lazy(() => import("./pages/Home"));
const Swap = lazy(() => import("./pages/Swap"));
const Liquidity = lazy(() => import("./pages/Liquidity"));
const Setting = lazy(() => import("./pages/Setting"));

const history = createBrowserHistory({
    basename: "",
    forceRefresh: false,
});

const AppRouter = () => {
    return (
        <Router history={history}>
            <Suspense fallback={<Spinner />}>
                <Header />
                <Switch>
                    <Layout>
                        <Route path="/" exact component={Home} />
                        <Route path="/swap" exact component={Swap} />
                        <Route path="/liquidity" exact component={Liquidity} />
                        <Route path="/setting" exact component={Setting} />
                    </Layout>
                </Switch>
            </Suspense>
        </Router>
    );
};

export default AppRouter;
