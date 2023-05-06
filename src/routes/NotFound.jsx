import { Box, Typography } from "@mui/material";
import React from "react";

const NotFound = () => {
  return (
    <Box
      sx={{ height: "100vh", width: "100vw", backgroundColor: "#000000" }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box display="flex" gap={2}>
        <Typography variant="h5" color="#FFF">
          404
        </Typography>
        <Typography variant="h5" color="#FFF">
          |
        </Typography>
        <Typography variant="h5" color="#FFF">
          Page not found
        </Typography>
      </Box>
    </Box>
  );
};

export default NotFound;
