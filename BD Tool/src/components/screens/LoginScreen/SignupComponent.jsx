import React from "react";
import { Box, Grid, Typography, TextField, Button, Paper } from "@mui/material";
import robot from "../../../assets/idea_robot.png"; // Import your login image here
import { loginStore } from "../../store";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


const SignUpComponent = () => {
  const [password, setPassword] = React.useState();
  const [name, setName] = React.useState();
  const [email, setEmail] = React.useState();
  const [username, setUsername] = React.useState();
  const [confirmPassword, setConfirmPassword] = React.useState();

  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (confirmPassword !== password) {
      alert("Passwords did not match");
    } else {
      try {
        const response = await fetch(
          `${API_BASE_URL}/users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "69420",
            },
            body: JSON.stringify({
              username: username,
              password: password,
              email: email,
              full_name: name,
              disabled: false,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to register");
        }
        navigate("/login");
      } catch (error) {
        console.error("Sign Up error:", error.message);
      }
    }
  };

  return (
    <Grid
      container
      spacing={0}
      style={{ height: "102vh" }}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Grid item xs={12} md={3}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          alignItems="center"
          padding={3}
          py={5}
          component={Paper}
        >
          <Typography variant="h5" gutterBottom>
            Sign Up
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              margin="normal"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Full Name"
              variant="outlined"
              margin="normal"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email"
              variant="outlined"
              margin="normal"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              margin="normal"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              variant="outlined"
              type="password"
              margin="normal"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              style={{ marginTop: 16 }}
            >
              Register
            </Button>
          </form>
        </Box>
      </Grid>

      <Grid item xs={12} md={3} borderRadius={0}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
        >
          <img
            src={robot}
            alt="Login"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default SignUpComponent;
