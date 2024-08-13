import React, { useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import MenuBarComponent from "./components/MenuBar/MenuBarComponent";
import HomeScreenComponent from "./components/screens/HomeScreen/HomeScreenComponent";
import { styled, useTheme } from "@mui/material/styles";
import AppBarComponent from "./components/Appbar/AppBarComponent";
import Box from "@mui/material/Box";
import ScoreResultsScreenComponent from "./components/screens/ScoreResultsScreen/ScoreResultsScreenComponent";
import ResultsScreenComponent from "./components/screens/ResultsScreen/ResultsScreenComponent";
import "./App.css";
import LoginScreenComponent from "./components/screens/LoginScreen/LoginScreenComponent";
import SignUpComponent from "./components/screens/LoginScreen/SignupComponent";
import { useAuth } from "./components/hooks/authHook";
import { destroyToken } from "./components/hooks/authHook";
import { useStore } from "./components/store";
import Notification from "./components/utilityComponents/Notification";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(2),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    overflowX: "hidden",
  })
);

function App() {
  const [openModal, setOpenModal] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const { setCsvData } = useStore();
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const location = useLocation();
  const isLoginScreen = location.pathname === "/login";
  const isRegisterScreen = location.pathname === "/register";

  const isAuthenticated = useAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (isLoginScreen) {
      destroyToken();
      setCsvData([]);
    }
  }, [isLoginScreen]);

  React.useEffect(() => {
    if (!isAuthenticated && !isRegisterScreen) {
      navigate("/login");
    }
  }, [isAuthenticated]);
  return (
    <div>
      <Notification />
      {!isLoginScreen && !isRegisterScreen && (
        <>
          <AppBarComponent
            setOpen={setOpen}
            open={open}
            handleDrawerOpen={handleDrawerOpen}
            setOpenModal={setOpenModal}
          />
          <MenuBarComponent open={open} handleDrawerClose={handleDrawerClose} />
        </>
      )}

      <Main open={open}>
        <Routes>
          <Route path="/">
            {isAuthenticated && (
              <>
                <Route
                  path="/"
                  element={
                    <HomeScreenComponent
                      setOpenModal={setOpenModal}
                      openModal={openModal}
                    />
                  }
                />
                <Route
                  path="/generate-icp"
                  element={<ScoreResultsScreenComponent />}
                />
                \
                <Route
                  path="/scored-results"
                  element={<ResultsScreenComponent />}
                />
              </>
            )}
            <Route path="/login" element={<LoginScreenComponent />} />
            <Route path="/register" element={<SignUpComponent />} />
          </Route>
        </Routes>
      </Main>
    </div>
  );
}

export default App;
