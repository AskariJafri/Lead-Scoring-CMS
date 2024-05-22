import * as React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import { Typography, TextField, Button, Grid } from "@mui/material";
import { useStore } from "../../store";
import { Link } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Image } from "@mui/icons-material";
import robot from "../../../../src/assets/phone_robot.png";
import { getToken } from "../../hooks/authHook";
const ScoreResultsScreenComponent = () => {
  const { loading, setLoading } = useStore();

  const {
    columns,
    icpData,
    csvData,
    weights,
    setWeights,
    setScores,
    setAppBarHeading,
    selectedColumns,
    setSelectedColumns,
    scores,
  } = useStore();
  React.useEffect(() => {
    setAppBarHeading("Scoring");
  }, []);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedColumns([...selectedColumns, value]);
    } else {
      setSelectedColumns(selectedColumns.filter((col) => col !== value));
    }
  };

  const handleWeightChange = (event, columnField) => {
    const newWeights = { ...weights };
    newWeights[columnField] = parseFloat(event.target.value);
    setWeights(newWeights);
  };

  const handleScoreButtonClick = async () => {
    const updatedIcp = { ...icpData };
    selectedColumns.forEach((selectedColumn) => {
      const column = columns.find((col) => col.field === selectedColumn);
      if (column) {
        const inputValue = document.getElementById(
          `${column.field}_input`
        ).value;
        updatedIcp[column.field] = inputValue;
      }
    });

    try {
      setLoading(true);
      const token = getToken(); // Get the token from wherever it's stored in your app
      const response = await fetch("http://localhost:8000/score-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
        body: JSON.stringify({
          data_json: csvData,
          icp_json: updatedIcp,
          scoring_weights: weights,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      console.log("API Response:", data);
      setScores(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const renderInputForColumn = (column) => {
    return (
      <>
        {/* {loading && <RingProgressComponent />} */}
        <Box
          key={column.field}
          display="flex"
          flexDirection={"row"}
          gap={2}
          m={2}
          // fullWidth
        >
          <TextField
            key={column.field + "_input"}
            label={column.headerName}
            variant="outlined"
            id={`${column.field}_input`}
            fullWidth
          />
          <TextField
            key={column.field + "_weight"}
            label={"weight"}
            variant="outlined"
            value={weights[column.field] || ""}
            onChange={(event) => handleWeightChange(event, column.field)}
            type="number"
            fullWidth
            inputProps={{
              step: "any", // Allow decimal numbers
              min: 0, // Minimum value
              max: 1,
            }}
          />
        </Box>
      </>
    );
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"start"}
      justifyContent={"center"}
      // mx={5}
      // my={2}
    >
      <Typography variant="h6">Detected Columns</Typography>
      <Typography variant="subtitle2" gutterBottom>
        Select the columns you want to add.
      </Typography>
      <Box mt={1} border="1px #5e687469 solid" borderRadius={1} padding={2}>
        {columns.map((col, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={selectedColumns.includes(col.field)}
                onChange={handleCheckboxChange}
                value={col.field}
              />
            }
            label={col.headerName}
          />
        ))}
      </Box>
      <Grid container display={"flex"} justifyContent={"space-between"} mt={2}>
        <Grid item display={"flex"} flexDirection={"column"} md={7}>
          <Typography variant="h6">Generated ICP</Typography>
          <Box
            border="1px #5e687469 solid"
            borderRadius={1}
            // padding={3}
            flex={1}
          >
            {selectedColumns.map((selectedColumn) => {
              const column = columns.find(
                (col) => col.field === selectedColumn
              );
              return column ? renderInputForColumn(column) : null;
            })}
          </Box>
        </Grid>
        <Grid item md={5}>
          <img src={robot} alt="robot" height={"500px"} width={"500px"} />
        </Grid>
      </Grid>
      <Box mt={5}>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIosIcon />}
          onClick={handleScoreButtonClick}
          component={Link}
          to="/scored-results"
        >
          Score
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIosNewIcon />}
          component={Link}
          to="/"
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default ScoreResultsScreenComponent;
