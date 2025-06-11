import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';

export default function SnackbarOpen({ message, useOpen, color }) {

    const [open, setOpen] = useOpen();

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <div>
            <Snackbar
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
            >
                <Alert onClose={handleClose} severity={color} sx={{ width: '100%' }}>
                    <span style={{ textTransform: "capitalize" }}>{message}</span>
                </Alert>
            </Snackbar>

        </div>
    );
}