import {
  Paper,
  TextField,
  Box,
  Table,
  Fade,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import Swal from "sweetalert2";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import { useNavigate } from "react-router-dom";
import Loading from "../utils/Loading";

function Home() {
  const [symbol, setSymbol] = useState("");
  const [loading, isLoading] = useState(false);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [type, setType] = useState("gainers");
  const [showHomeData, setShowHomeData] = useState(false);
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  useEffect(() => {
    const getData = () => {
      isLoading(true);
      fetch(
        `https://financialmodelingprep.com/api/v3/stock_market/${
          type === "gainers" ? "gainers" : "losers"
        }?apikey=${process.env.REACT_APP_FMP}`
      )
        .then((response) => response.json())
        .then((response) => {
          isLoading(false);
          setShowHomeData(true);
          setData(response);
        })
        .catch((err) => {
          console.error(err);
          Swal.fire(
            "Something went wrong while fetching from API!",
            "",
            "error"
          );
        });
    };
    getData();
  }, [type]);

  return (
    <>
      {loading && <Loading />}
      <Box
        sx={{ width: { xs: "90%", sm: "80%", md: "50%", lg: "40%" } }}
        mx="auto"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.target.elements[0].blur(); // blur the text field
            navigate(`/home/symbol/${symbol.trim()}`);
          }}
          id="userinput"
        >
          <TextField
            fullWidth
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            autoComplete="off"
            placeholder="Enter Stock Symbol"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="large"
                    disabled={loading || !symbol}
                    type="submit"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </form>
      </Box>
      {showHomeData && (
        <Box
          sx={{ width: { xs: "90%", md: "80%", lg: "75%" } }}
          mx="auto"
          my={2}
        >
          <Box sx={{ textAlign: "center" }}>
            <FormControl sx={{ my: 2 }}>
              <InputLabel>Data Type</InputLabel>
              <Select
                value={type}
                label="Data Type"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value={"gainers"}>Top Gainers</MenuItem>
                <MenuItem value={"losers"}>Top Losers</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
            Top {type === "gainers" ? "Gainers" : "Losers"} in the Market
          </h2>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">
                    <h3>Name</h3>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <h3>Symbol</h3>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <h3>Price</h3>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <h3>Change</h3>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <h3>Change %</h3>
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <Fade in key={row.symbol} timeout={(index + 1) * 200}>
                    <TableRow
                      onClick={() => {
                        navigate(`/home/symbol/${row.symbol}`);
                      }}
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          backgroundColor: " #EEEEEE",
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.symbol}
                      </TableCell>
                      <TableCell align="center">{row.price}</TableCell>
                      <TableCell align="center">{row.change}</TableCell>
                      <TableCell align="center">
                        {row.changesPercentage}
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
}

export default Home;
