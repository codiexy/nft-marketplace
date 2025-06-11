import React from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Image from 'next/image';

export default function Login() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
  };
  return (

    <div className="container-flex mx-auto header px-12 loginpage_wrap">
      <div className="lg:flex md:flex block flex-row items-center justify-center">
        <div className="basis-6/6 flex left_header items-center">
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}
            data-aos="zoom-in"
            data-aos-duration="3000"
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            {/* <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              /> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            {/* <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid> */}
          </Box>
        </div>
        <div className="basis-6/6 flex left_header items-center"
          data-aos="zoom-in"
          data-aos-duration="3000"
        >
          <Image
            src="/images/login-image.png"
            className="rounded-lg object-cover lg:pr-0 md:pr-0 pr-5 w-full"
            alt="my image"
            height="400px"
            width="400px"
          />
        </div>
      </div>
    </div>



  )
}

