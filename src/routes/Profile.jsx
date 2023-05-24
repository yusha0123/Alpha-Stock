import {
  Avatar,
  Button,
  Stack,
  Grid,
  TextField,
  Paper,
  Zoom,
} from "@mui/material";
import React, { useState } from "react";
import { auth } from "../fireConfig";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/Key";
import { styled } from "@mui/material/styles";
import { storage } from "../fireConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deepOrange } from "@mui/material/colors";
import { toast } from "react-hot-toast";

function Profile() {
  const [userPass1, setUserPass1] = useState("");
  const [userPass2, setUserPass2] = useState("");
  const [newPass, setNewPass] = useState("");
  const [cNewPass, setNewCPass] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);

  const StyledButton = styled(Button)(() => ({
    textTransform: "none",
    letterSpacing: "1px",
    backgroundColor: "rgb(100 116 139)",
    ":hover": {
      backgroundColor: " rgb(71 85 105)",
    },
  }));

  const changeAvatar = async (e) => {
    if (!e.target.files[0]) {
      return;
    }
    const storageRef = ref(storage, "avatars/" + auth.currentUser.uid);
    setDisableBtn(true);
    const loadingToastId = toast.loading("Uploading Avatar...");
    try {
      await uploadBytes(storageRef, e.target.files[0]);
      const avatarURL = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, {
        photoURL: avatarURL,
      });
      toast.success("Avatar Updated Successfully!", {
        id: loadingToastId,
      });
      setDisableBtn(false);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, Please try Again Later!", {
        id: loadingToastId,
      });
      setDisableBtn(false);
    }
  };

  const handlePassClick = (e) => {
    e.preventDefault();
    if (newPass !== cNewPass) {
      toast.error("Passwords doesn't match!");
    } else if (newPass.length < 7 || userPass1.length < 7) {
      toast.error("Password length is too short!");
    } else {
      setDisableBtn(true);
      const passChangeToastId = toast.loading("Processing Changes...");
      reauthenticate(userPass1).then((success) => {
        if (success) {
          ChangePass(passChangeToastId);
        } else {
          setDisableBtn(false);
          toast.error("Incorrect Password!", {
            id: passChangeToastId,
          });
        }
      });
    }
  };

  const ChangePass = (passChangeToastId) => {
    updatePassword(auth.currentUser, newPass)
      .then(() => {
        toast.success("Password Updated Successfully!", {
          id: passChangeToastId,
        });
      })
      .catch((error) => {
        toast.error(error.code, {
          id: passChangeToastId,
        });
      })
      .finally(() => {
        setDisableBtn(false);
        setNewPass("");
        setNewCPass("");
        setUserPass1("");
      });
  };

  const handleEmailClick = (e) => {
    e.preventDefault();
    if (userPass2.length < 7) {
      toast.error("Password length is too Short!");
    } else {
      setDisableBtn(true);
      const emailChangeToastId = toast.loading("Processing Changes...");
      reauthenticate(userPass2).then((success) => {
        if (success) {
          ChangeEmail(emailChangeToastId);
        } else {
          toast.error("Incorrect Password!", {
            id: emailChangeToastId,
          });
          setDisableBtn(false);
        }
      });
    }
  };

  const ChangeEmail = (emailChangeToastId) => {
    updateEmail(auth.currentUser, newEmail)
      .then(() => {
        toast.success("Email Updated Successfully!", {
          id: emailChangeToastId,
        });
      })
      .catch((error) => {
        toast.error(error.code, {
          id: emailChangeToastId,
        });
      })
      .finally(() => {
        setDisableBtn(false);
        setNewEmail("");
        setUserPass2("");
      });
  };

  const reauthenticate = async (password) => {
    const credentials = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    return reauthenticateWithCredential(auth.currentUser, credentials)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  return (
    <>
      <Stack
        direction="column"
        gap={3}
        sx={{ width: { xs: "90%", sm: "75%", md: "70%", lg: "65%" } }}
        mx="auto"
        mb={10}
      >
        {/* Account Details Paper */}
        <Zoom in={true} timeout={1000}>
          <Paper
            elevation={3}
            style={{ padding: 25, backgroundColor: "#F5F5F5" }}
          >
            <form>
              <Stack direction="column" gap={2} alignItems="center" mb={3}>
                <Avatar
                  src={auth.currentUser.photoURL && auth.currentUser.photoURL}
                  sx={{
                    width: { xs: 110, lg: 150 },
                    height: { xs: 110, lg: 150 },
                    bgcolor: !auth.currentUser.photoURL && deepOrange[500],
                  }}
                >
                  {auth.currentUser.photoURL === null &&
                    auth.currentUser.displayName.charAt(0).toUpperCase()}
                </Avatar>
                <StyledButton
                  variant="contained"
                  component="label"
                  disabled={disableBtn}
                  endIcon={<PhotoCamera />}
                >
                  Change Avatar
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={changeAvatar}
                  />
                </StyledButton>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={auth.currentUser.displayName}
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} mx="auto">
                  <TextField
                    label="Email"
                    fullWidth
                    value={auth.currentUser.email}
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Zoom>
        {/* Change Password Paper */}
        <Zoom in={true} timeout={1000}>
          <Paper
            elevation={3}
            style={{ padding: 25, backgroundColor: "#F5F5F5" }}
          >
            <form onSubmit={handlePassClick}>
              <Stack direction="column" gap={2} alignItems="center" mb={3}>
                <h2> Change Password</h2>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Old Password"
                      fullWidth
                      required
                      value={userPass1}
                      onChange={(e) => setUserPass1(e.target.value)}
                      autoComplete="off"
                      type="password"
                      spellCheck="false"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="New Password"
                      fullWidth
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      autoComplete="off"
                      type="password"
                      spellCheck="false"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} mx="auto">
                    <TextField
                      label="Confirm Password"
                      fullWidth
                      required
                      value={cNewPass}
                      onChange={(e) => setNewCPass(e.target.value)}
                      autoComplete="off"
                      type="password"
                      spellCheck="false"
                    />
                  </Grid>
                </Grid>
                <StyledButton
                  variant="contained"
                  onClick={handlePassClick}
                  disabled={disableBtn}
                  endIcon={<KeyIcon />}
                  type="submit"
                >
                  Update Password
                </StyledButton>
              </Stack>
            </form>
          </Paper>
        </Zoom>
        {/* Change Email Paper */}
        <Zoom in={true} timeout={1000}>
          <Paper
            elevation={3}
            style={{ padding: 25, backgroundColor: "#F5F5F5" }}
          >
            <form onSubmit={handleEmailClick}>
              <Stack direction="column" gap={2} alignItems="center" mb={3}>
                <h2>Change Email</h2>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Your Password"
                      fullWidth
                      required
                      value={userPass2}
                      type="password"
                      autoComplete="off"
                      spellCheck="false"
                      onChange={(e) => setUserPass2(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="New Email"
                      fullWidth
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      autoComplete="off"
                      type="email"
                      spellCheck="false"
                    />
                  </Grid>
                </Grid>
                <StyledButton
                  variant="contained"
                  onClick={handleEmailClick}
                  disabled={disableBtn}
                  type="submit"
                  endIcon={<EmailIcon />}
                >
                  Update Email
                </StyledButton>
              </Stack>
            </form>
          </Paper>
        </Zoom>
      </Stack>
    </>
  );
}

export default Profile;
