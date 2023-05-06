import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Avatar,
  Tooltip,
  Table,
  Paper,
  Grid,
  TableContainer,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Snackbar,
  Alert,
  Grow,
  Zoom,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import CreateChart from "../components/CreateChart";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "../fireConfig";
import Loading from "../utils/Loading";

const Search = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [Data, setData] = useState([]);
  const docRef = doc(firestore, "users", auth.currentUser.uid);
  const [logo, setlogo] = useState("");
  const [flag, setflag] = useState(false);
  const [title, setTitle] = useState("");
  const [AlreadyAdded, setAlreadyAdded] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setflag(false);
      setAlert({
        show: false,
        message: "",
      });
      setLoading(true);
      setAlreadyAdded(false);
      const urls = [
        `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${process.env.REACT_APP_TWELVE_KEY_1}`,
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.REACT_APP_TWELVE_KEY_1}`,
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.REACT_APP_FINHUB_KEY}`,
      ];
      const requests = urls.map((url) => fetch(url));
      const responses = await Promise.all(requests);
      const data = await Promise.all(
        responses.map((response) => response.json())
      );
      if (data[0].code === 400 || data[1].code === 400) {
        setAlert({
          show: true,
          message: "No Data Found!",
        });
      } else if (data[0].code === 429 || data[1].code === 429) {
        //excessive api credits used
        setAlert({
          show: true,
          message: "Excessive api credits used please try Later!",
        });
      } else {
        setData([
          {
            item: "Date",
            value: data[0].datetime,
          },
          {
            item: "Last Updated",
            value: new Date(data[0].timestamp * 1000).toLocaleTimeString(
              "en-US"
            ),
          },
          {
            item: "Open",
            value: data[0].open,
          },
          {
            item: "High",
            value: data[0].high,
          },
          {
            item: "Low",
            value: data[0].low,
          },
          {
            item: "Close",
            value: data[0].close,
          },
          {
            item: "Price",
            value: data[1].price,
          },
          {
            item: "Previous Close",
            value: data[0].previous_close,
          },
          {
            item: "Change",
            value: data[0].change,
          },
          {
            item: "Fifty Two Week High",
            value: data[0].fifty_two_week.high,
          },
          {
            item: "Fifty Two Week Low",
            value: data[0].fifty_two_week.low,
          },
        ]);
        setflag(true);
        setlogo(data[2].logo);
        setTitle(data[0].name + " (" + data[0].symbol + ")");
        const docSnap = await getDoc(docRef);
        const userData = docSnap.data();
        const portfolio = userData.portfolio;
        portfolio.forEach((item) => {
          const stockSymbol = item.stockSymbol;
          if (stockSymbol === data[0].symbol) {
            setAlreadyAdded(true);
          }
        });
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [symbol]);

  const removeFromDatabase = async () => {
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    const filteredObject = userData.portfolio.filter(function (obj) {
      return (
        obj.stockSymbol !==
        title.substring(title.indexOf("(") + 1, title.indexOf(")")).trim()
      );
    });
    try {
      await updateDoc(docRef, {
        portfolio: filteredObject,
      });
      setAlreadyAdded(false);
      setSnack({
        open: true,
        severity: "warning",
        message: "Stock removed from your Portfolio!",
      });
    } catch (error) {
      console.log(error);
      setSnack({
        open: true,
        severity: "error",
        message: "Something went Wrong!",
      });
    }
  };

  const insertIntoDatabase = async () => {
    try {
      await updateDoc(docRef, {
        portfolio: arrayUnion({
          Name: title.substring(0, title.indexOf("(")).trim(),
          stockSymbol: title
            .substring(title.indexOf("(") + 1, title.indexOf(")"))
            .trim(),
          previous_price: Data[6].value,
          date_added: new Date().toLocaleString(),
        }),
      });
      setAlreadyAdded(true);
      setSnack({
        open: true,
        severity: "success",
        message: "Stock added to your Portfolio!",
      });
    } catch (error) {
      console.log(error);
      setSnack({
        open: true,
        severity: "error",
        message: "Something went Wrong!",
      });
    }
  };
  return (
    <>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
      {loading && <Loading />}
      <Box
        sx={{ width: { xs: "90%", sm: "80%", md: "50%", lg: "40%" } }}
        mx="auto"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.target.elements[0].blur(); // blur the text field
            navigate(`/home/symbol/${input.trim()}`);
          }}
        >
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            placeholder="Enter Stock Symbol"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="large"
                    disabled={loading || !input}
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
      {alert.show && (
        <Box
          sx={{ width: { xs: "90%", sm: "80%", md: "50%", lg: "40%" } }}
          mx="auto"
          mt={5}
        >
          <Alert severity="error" variant="filled">
            {alert.message}
          </Alert>
        </Box>
      )}
      {flag && (
        <>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            columnGap={2}
            sx={{
              padding: 2,
            }}
          >
            {logo && (
              <Avatar
                src={logo}
                sx={{ width: 50, height: 50 }}
                variant="rounded"
              />
            )}
            <h1 style={{ fontSize: "22px" }}>{title}</h1>
            {AlreadyAdded ? (
              <Tooltip title="Remove from Portfolio">
                <IconButton onClick={removeFromDatabase}>
                  <StarIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Add to Portfolio">
                <IconButton onClick={insertIntoDatabase}>
                  <StarBorderIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Grid container spacing={1} mb={8}>
            <Grow in={flag} timeout={1000}>
              <Grid item xs={12} md={4} lg={3}>
                <Box width="90%" mx="auto">
                  <TableContainer
                    component={Paper}
                    sx={{ backgroundColor: "rgb(226 232 240)" }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" colSpan={2}>
                            <h3>Price Statistics</h3>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Data.map((row) => (
                          <TableRow
                            key={row.item}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.item}
                            </TableCell>
                            <TableCell align="right">
                              <b>{row.value}</b>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            </Grow>
            <Zoom in={flag} timeout={1000}>
              <Grid item xs={12} md={8} lg={9}>
                <CreateChart symbol={symbol} />
              </Grid>
            </Zoom>
          </Grid>
        </>
      )}
    </>
  );
};

export default Search;
