import { Stack, Typography, Box, Alert, Grow } from "@mui/material";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, firestore } from "../fireConfig";
import { updateProfile } from "firebase/auth";
import { toast } from "react-hot-toast";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import Toolbar from "@mui/material/Toolbar";
import { Link } from "react-router-dom";

function Signup_Login() {
  const [logIn, setlogIn] = useState(false);
  const [flag, setFlag] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    open: false,
    text: "",
  });
  const [user, setUser] = useState({
    name: "",
    email: "",
    pass: "",
    cpass: "",
  });

  const SignUp = (e) => {
    e.preventDefault();
    if (user.pass !== user.cpass) {
      setAlert({
        open: true,
        text: "Password doesn't match!",
      });
      setUser({
        ...user,
        cpass: "",
        pass: "",
      });
      return;
    } else if (user.pass.length < 7) {
      setAlert({
        open: true,
        text: "Password length is too Short!",
      });
      return;
    }
    setFlag(true);
    createUserWithEmailAndPassword(auth, user.email, user.pass)
      .then(async (res) => {
        setFlag(true);
        const CurrentUser = res.user;
        await updateProfile(CurrentUser, {
          displayName: user.name,
        });
        await setDoc(doc(firestore, "users", auth.currentUser.uid), {
          portfolio: [],
        });
        toast.success("Registration Successful!");
        navigate("/"); //navigating the user to home page
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          toast.error("Email already Exists!");
        } else if (error.code === "auth/invalid-email") {
          toast.error("Please enter a valid email address!");
        } else {
          toast.error(error.code);
        }
        setFlag(false);
        setUser({
          name: "",
          email: "",
          pass: "",
          cpass: "",
        });
      });
  };

  const Login = (e) => {
    e.preventDefault();
    if (user.email.length < 5 || user.pass.length < 7) {
      setAlert({
        open: true,
        text: "Invalid Credentials!",
      });
      return;
    }
    setFlag(true);
    signInWithEmailAndPassword(auth, user.email, user.pass)
      .then(() => {
        navigate("/"); //navigating the user to home page
      })
      .catch((error) => {
        if (
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found"
        ) {
          toast.error("Invalid Credentials!");
        } else if (error.code === "auth/invalid-email") {
          toast.error("Please enter a valid email address!");
        } else {
          toast.error(error.code);
        }
        setUser({
          ...user,
          pass: "",
        });
        setAlert({
          open: false,
          text: "",
        });
        setFlag(false);
      });
  };

  return (
    <>
      <Stack
        direction="column"
        sx={{ height: "100vh", width: "100%" }}
        alignItems="center"
        justifyContent="center"
      >
        <Box position="fixed" top={0}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <h2 style={{ letterSpacing: "1.5px" }}>AlphaStock</h2>
              </Link>
            </Box>
          </Toolbar>
        </Box>
        <Grow in={true} timeout={1000}>
          <Box
            sx={{
              width: { xs: "85%", sm: "60%", md: "30%", lg: "25%" },
              boxShadow: 3,
              borderRadius: 2,
              px: 4,
              py: 6,
            }}
          >
            <form onSubmit={logIn ? SignUp : Login}>
              <Stack direction="column" gap={2} alignItems="center">
                <h1>
                  {logIn ? "Create your account" : "Sign in to your account"}
                </h1>
                <Box sx={{ width: "100%" }}>
                  {alert.open && (
                    <Alert
                      severity="error"
                      onClose={() => {
                        setAlert({
                          open: false,
                          text: "",
                        });
                      }}
                    >
                      {alert.text}
                    </Alert>
                  )}
                </Box>
                {logIn && (
                  <TextField
                    label="Full Name"
                    fullWidth
                    required
                    value={user.name}
                    onChange={(e) => {
                      setUser({
                        ...user,
                        name: e.target.value,
                      });
                    }}
                    autoComplete="off"
                    spellCheck="false"
                    size="small"
                  />
                )}
                <TextField
                  label="Email"
                  fullWidth
                  required
                  type="email"
                  value={user.email}
                  onChange={(e) => {
                    setUser({
                      ...user,
                      email: e.target.value,
                    });
                  }}
                  autoComplete="off"
                  spellCheck="false"
                  size="small"
                />
                <TextField
                  label="Password"
                  fullWidth
                  required
                  value={user.pass}
                  onChange={(e) => {
                    setUser({
                      ...user,
                      pass: e.target.value,
                    });
                  }}
                  autoComplete="off"
                  spellCheck="false"
                  size="small"
                  type={showPass ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPass(!showPass)}
                          edge="end"
                        >
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {logIn && (
                  <TextField
                    label="Confirm Password"
                    fullWidth
                    required
                    value={user.cpass}
                    onChange={(e) => {
                      setUser({
                        ...user,
                        cpass: e.target.value,
                      });
                    }}
                    autoComplete="off"
                    spellCheck="false"
                    size="small"
                    type={showCPass ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowCPass(!showCPass)}
                            edge="end"
                          >
                            {showCPass ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                {logIn && (
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={flag}
                    fullWidth={true}
                    loadingIndicator="Please wait..."
                    sx={{ textTransform: "none", letterSpacing: "2px" }}
                  >
                    Create Account
                  </LoadingButton>
                )}
                {!logIn && (
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={flag}
                    fullWidth={true}
                    loadingIndicator="Please wait..."
                    sx={{ textTransform: "none", letterSpacing: "2px" }}
                  >
                    Continue
                  </LoadingButton>
                )}
                <Typography component="div">
                  {logIn
                    ? " Already Have an Account ?"
                    : "Don't have an account?"}
                  <Button
                    variant="text"
                    onClick={() => {
                      setlogIn(!logIn);
                      setAlert({
                        open: false,
                        text: "",
                      });
                    }}
                    size="small"
                    sx={{ textTransform: "none", letterSpacing: "1px" }}
                  >
                    {logIn ? "Sign In" : "Sign Up"}
                  </Button>
                </Typography>
              </Stack>
            </form>
          </Box>
        </Grow>
      </Stack>
    </>
  );
}

export default Signup_Login;
