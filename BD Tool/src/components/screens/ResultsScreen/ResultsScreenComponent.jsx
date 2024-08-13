import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import ResultsTable from "../../utilityComponents/ResultsTable/ResultsTable";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from '@mui/icons-material/Check';  
import CircularProgress from '@mui/material/CircularProgress';
import { getUsername } from "../../hooks/authHook";

const SOCKET_URL = import.meta.env.SOCKET_URL || "ws://localhost:8000";


const ResultsScreenComponent = () => {
  const { scores, csvData, setAppBarHeading, loading, setScores } = useStore();
  const [scoreColumns, setScoreColumns] = useState([]);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    setAppBarHeading("Results");
  }, []);

  useEffect(() => {
    const username = getUsername()
    const ws = new WebSocket(`${SOCKET_URL}/ws/${username}`); 

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data received from WebSocket:", data);
      setScores([ ...data]);
    };

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

  }, [setScores]);

  useEffect(() => {
    console.log("scores",scores)
    if (scores.length === csvData.length && csvData.length) {
      setSuccess(true);
    }

    if (scores) {
      const columns = Object.keys(scores?.[0] || []).map((key) => ({
        field: key,
        headerName: key,
        width: key === "id" ? 70 : 150,
        headerAlign: "left",
        cellClassName: (params) => params.field.includes("_score") ? "score-column" : "",
        headerClassName: key.includes("score") ? "score-column-header" : "",
      }));

      const idColumnIndex = columns.findIndex((col) => col.field === "id");
      if (idColumnIndex !== -1) {
        const idColumn = columns.splice(idColumnIndex, 1)[0];
        columns.unshift(idColumn);
      }
      setScoreColumns(columns);
    }
  }, [scores, csvData]);

  return (
    <Box flexDirection={"column"}>
      {scores && (
        <ResultsTable
          csvData={scores}
          columns={scoreColumns}
          loading={loading}
        />
      )}
      <Box display={"flex"} justifyContent={"space-between"} flexDirection={"row"} mt={2}>
        <Box display={"flex"} flexDirection={"row"} alignItems={"center"} gap={2}>
          <Typography color={"GrayText"}>
            Records processed: {scores.length} / {csvData.length}   
          </Typography>
          {success ? <CheckIcon /> : csvData.length>0? <CircularProgress size={15} />:<></>}
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIosNewIcon />}
          component={Link}
          to="/generate-icp"
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default ResultsScreenComponent;
