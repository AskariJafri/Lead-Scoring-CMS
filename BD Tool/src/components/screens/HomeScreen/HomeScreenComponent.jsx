import React from "react";
import Papa from "papaparse";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link } from "react-router-dom";
import { useStore } from "../../store";
import ResultsTable from "../../utilityComponents/ResultsTable/ResultsTable";
import UploadFileModal from "../../utilityComponents/UploadFile/UploadFileModal";
import { apiRequest } from "../../../api/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  const handleUploadCSV = (event) => {
    const file = event.target.files[0];
    const filename = file.name.split(".")[0];
    const fileType = file.name.split(".").pop().toLowerCase();
    const user_id = localStorage.getItem("userId")
    if (fileType !== "csv") {
      alert("Please upload a CSV file.");
      return;
    }
    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
        apiRequest("POST",`${API_BASE_URL}/files/add-file`,{
            filename: filename,
            data: result.data,
            added_by: user_id
          })
      },
      header: true,
    });
    setOpenModal(false);
  };

  return (
    <>
      {!csvData.length ? "Upload Box will be shown" : (
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
      {openModal && (
        <UploadFileModal
          openUploadFileModal={openModal}
          closeUploadFileModal={() => setOpenModal(false)}
          handleUploadCSV={handleUploadCSV}
          setOpenModal={setOpenModal}
        />
      )}
    </>
  );
};

export default HomeScreenComponent;
