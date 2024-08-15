import React from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link } from "react-router-dom";
import { useStore } from "../../store";
import ResultsTable from "../../utilityComponents/ResultsTable/ResultsTable";
import { apiRequest } from "../../../api/api";
import UploadFileScreen from "../../utilityComponents/UploadFile/UploadFileScreen";


const HomeScreenComponent = ({ openModal, setOpenModal }) => {
  const {
    columns,
    setColumns,
    setAppBarHeading,
    csvData,
    setCsvData,
    loading,
  } = useStore();
  if (csvData) {
    csvData?.forEach((entry, index) => {
      entry["id"] = index + 1;
    });
  }

  React.useEffect(() => {
    setAppBarHeading("Dashboard");
  }, []);
  React.useEffect(() => {
    if (csvData) {
      const columns = Object.keys(csvData?.[0] || []).map((key, val) => ({
        field: key,
        headerName: key,
        width: key === "id" ? 30 : 150,
        headerAlign: "left",
      }));

      // Reorder columns so that id column is the first column
      const idColumnIndex = columns.findIndex((col) => col.field === "id");
      if (idColumnIndex !== -1) {
        const idColumn = columns.splice(idColumnIndex, 1)[0];
        columns.unshift(idColumn);
      }
      setColumns(columns);
    }
  }, [csvData]);

  
  return (
    <>
      {!csvData.length ? <UploadFileScreen  openModal setOpenModal
          
          /> : (
        <ResultsTable csvData={csvData} columns={columns} loading={loading} />
      )}
      <Box display={"flex"} justifyContent={"end"} my={2}>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIosIcon />}
          component={Link}
          to="/generate-icp"
        >
          Next
        </Button>
      </Box>
     
    </>
  );
};

export default HomeScreenComponent;
