import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { notificationStore } from '../store';
import Slide from '@mui/material/Slide';


function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const Notification = () => {
  const { open, type, message, title, setOpen } = notificationStore();
  
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition} 
    >
      <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
        <strong>{title}</strong> - {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
