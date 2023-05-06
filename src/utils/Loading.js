import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";

const Loading = () => {
  const [colorIndex, setColorIndex] = useState(0);
  const colors = ["secondary", "success", "inherit"];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const color = colors[colorIndex];

  return (
    <div className="loading">
      <CircularProgress color={color} />
    </div>
  );
};

export default Loading;
