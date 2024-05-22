import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import { styled, useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { Box, Typography } from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { Link } from "react-router-dom";
import robot from "../../../src/assets/robot.png";
import { useStore } from "../store";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const MenuBarComponent = ({ open, handleDrawerClose }) => {
  const theme = useTheme();
  const { appBarHeading } = useStore();
  return (
    <>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#213955",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          my={2}
        >
          <Box display={"flex"} alignItems={"center"}>
            <img src={robot} alt="robot" height={"60px"} width={"60px"} />
            <Typography sx={{ fontWeight: 600 }} color={"whitesmoke"}>
              AS Colabs
            </Typography>
          </Box>

          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon sx={{ color: "whitesmoke" }} />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
        </Box>
        <Divider />
        <List>
          {["Dashboard", "Scoring", "Results"].map((text, index) => (
            <ListItem
              key={text}
              disablePadding
              component={Link}
              to={
                text == "Dashboard"
                  ? "/"
                  : text == "Scoring"
                  ? "/generate-icp"
                  : "/scored-results"
              }
              sx={{
                color: "whitesmoke",
                backgroundColor: appBarHeading === text && "#5e687469",
              }}
            >
              <ListItemButton>
                <ListItemIcon sx={{ color: "whitesmoke" }}>
                  {text == "Dashboard" ? (
                    <HomeIcon />
                  ) : text == "Scoring" ? (
                    <AccountTreeIcon />
                  ) : (
                    <TaskAltIcon />
                  )}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>
      <DrawerHeader />
    </>
  );
};

export default MenuBarComponent;
