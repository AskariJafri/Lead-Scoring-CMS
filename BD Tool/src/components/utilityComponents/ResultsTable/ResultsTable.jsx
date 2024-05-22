import React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import CssBaseline from "@mui/material/CssBaseline";
import { CustomNoRowsOverlay } from "../CustomNoRowsOverlay/CustomNoRowsOverlay";
const ResultsTable = ({ csvData, columns, loading }) => {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: "background.default",
        height: "76vh",
      }}
    >
      <CssBaseline />
      <DataGrid
        rows={csvData}
        columns={columns}
        checkboxSelection={false}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          boxShadow: 2,
          borderRadius: 0,
          boxShadow: 0,
          "& .MuiDataGrid-cell:hover": {
            color: "blue",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
          },
        }}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default ResultsTable;
