import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SpecialRoute from "./utils/SpecialRoute";
import PrivateRoutes from "./utils/PrivateRoutes";
import React, { lazy, Suspense } from "react";
import Loading from "./utils/Loading";

function App() {
  const NotFound = lazy(() => import("./routes/NotFound"));
  const SignupLogin = lazy(() => import("./routes/SignupLogin"));
  const Root = lazy(() => import("./routes/Root"));
  const Home = lazy(() => import("./routes/Home"));
  const Search = lazy(() => import("./routes/Search"));
  const Profile = lazy(() => import("./routes/Profile"));
  const Portfolio = lazy(() => import("./routes/Portfolio"));
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<Home />} path="/home" exact />
            <Route element={<Search />} path="/home/symbol/:symbol" exact />
            <Route element={<Profile />} path="/profile" exact />
            <Route element={<Portfolio />} path="/portfolio" exact />
          </Route>
          <Route element={<SpecialRoute />}>
            <Route element={<SignupLogin />} path="/authorize" exact />
            <Route element={<Root />} path="/" exact />
          </Route>
          <Route element={<NotFound />} path="*" exact />
        </Routes>
      </Router>
    </Suspense>
  );
}

export default App;
