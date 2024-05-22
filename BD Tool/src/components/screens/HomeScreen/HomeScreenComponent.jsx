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
    if (fileType !== "csv") {
      alert("Please upload a CSV file.");
      return;
    }
    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          filename: filename,
          data: result.data,
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        fetch("http://localhost:8000/files/add-file", requestOptions)
          .then((response) => response)
          .then((result) => {
            if (result.status == 417) {
              alert("A file with this name already exists!");
            } else {
              console.log("File added to the database");
            }
          })
          .catch((error) => alert(error));
      },
      header: true,
    });
    setOpenModal(false);
  };

  return (
    <>
      {csvData && (
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
