// ResultsScreenComponent.jsx
import React, { useState } from "react";
import { useStore } from "./../../store";
import ResultsTable from "../../utilityComponents/ResultsTable/ResultsTable";
import Box from "@mui/material/Box";
import { Typography, TextField, Button } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
const ResultsScreenComponent = () => {
  const { scores, csvData, setAppBarHeading, loading, setLoading } = useStore();
  const [scoreColumns, setScoreColumns] = useState([]);

  React.useEffect(() => {
    setAppBarHeading("Results");
  }, []);

  React.useEffect(() => {
    if (scores) {
      const columns = Object.keys(scores?.[0] || []).map((key, val) => ({
        field: key,
        headerName: key,
        width: key === "id" ? 70 : 150,
        headerAlign: "left",
        cellClassName: (params) => {
          return params.field.includes("_score") ? "score-column" : "";
        },
        headerClassName: key.includes("score") ? "score-column-header" : "",
      }));

      // Reorder columns so that id column is the first column
      const idColumnIndex = columns.findIndex((col) => col.field === "id");
      if (idColumnIndex !== -1) {
        const idColumn = columns.splice(idColumnIndex, 1)[0];
        columns.unshift(idColumn);
      }

      setScoreColumns(columns);
    }
  }, [scores]);
  console.log("first", loading);
  React.useEffect(() => {}, [scores]);
  return (
    <Box flexDirection={"column"}>
      {csvData && (
        <ResultsTable
          csvData={scores}
          columns={scoreColumns}
          loading={loading}
        />
      )}
      <Box display={"flex"} justifyContent={"end"} flexDirection={"row"} mt={2}>
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
