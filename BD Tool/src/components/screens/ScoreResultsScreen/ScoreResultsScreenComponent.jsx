import React, { useState, useEffect } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import { Typography, TextField, Button, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useStore } from "../../store";
import { Link } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import robot from "../../../../src/assets/phone_robot.png";
import { getToken } from "../../hooks/authHook";
import { apiRequest } from "../../../api/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


const ScoreResultsScreenComponent = () => {
  const { setLoading, setScores, columns,setIcpData, icpData, csvData, weights, setWeights, setAppBarHeading, selectedColumns, setSelectedColumns } = useStore();
  const [processedMessages, setProcessedMessages] = useState([]);

  useEffect(() => {
    setAppBarHeading("Scoring");
    setWeights({})
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
    const updatedIcp = {};
    selectedColumns.forEach((selectedColumn) => {
      const column = columns.find((col) => col.field === selectedColumn);
      if (column) {
        const inputValue = document.getElementById(`${column.field}_input`).value;
        updatedIcp[column.field] = inputValue;
      }
    });

    try {
      setScores([])
      setLoading(true);
      await apiRequest('POST', `${API_BASE_URL}/score-leads`,{
        data_json: csvData,
        icp_json: updatedIcp,
        scoring_weights: weights,
      })

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const renderInputForColumn = (column) => {
    return (
      <Box key={column.field} display="flex" flexDirection={"row"} gap={2} m={2}>
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
    );
  };

  return (
    <Box display={"flex"} flexDirection={"column"} alignItems={"start"} justifyContent={"center"}>
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
          <Box border="1px #5e687469 solid" borderRadius={1} flex={1}>
            {selectedColumns.map((selectedColumn) => {
              const column = columns.find((col) => col.field === selectedColumn);
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
      {/* Add a table to display the scores in real-time */}
     
    </Box>
  );
};

export default ScoreResultsScreenComponent;
