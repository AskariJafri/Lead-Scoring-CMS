import React from 'react';
import { Box, Grid, Typography, TextField, Button, Paper, Link } from '@mui/material';
import robot from '../../../assets/hello_robot.png'; // Import your login image here
import { loginStore } from '../../store';
import { notificationStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../api/api';
import Notification from '../../utilityComponents/Notification';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LoginScreenComponent = () => {
  const { username, password, setUsername, setPassword } = loginStore();
  const { setNotification, setOpen } = notificationStore(); // Destructure setNotification from notification store
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = await apiRequest("POST", `${API_BASE_URL}/auth/token`, {
        username: username,
        password: password,
      });

      const token = data.access_token;
      const user_id = data.user_id;
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", user_id);
      setNotification('success', 'Login Successful', 'You have successfully logged in.');
      setOpen(true)
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.message);
      setNotification('error', 'Login Failed', error.message);
    }
  };

  return (
    <Grid
      container
      spacing={0}
      style={{ height: "80vh" }}
      alignItems={"center"}
      justifyContent={"center"}
      overflow={"hidden"}
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
            Login
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
              label="Password"
              variant="outlined"
              type="password"
              margin="normal"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              style={{ marginTop: 16 }}
            >
              Sign In
            </Button>
          </form>
          <Link href="/register" underline="hover" mt={2}>
            {"New User? Register"}
          </Link>
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

export default LoginScreenComponent;
