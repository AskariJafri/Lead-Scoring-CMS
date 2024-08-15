import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import DownloadIcon from "@mui/icons-material/Download";
import { useStore } from "../../store";
import { apiRequest } from "../../../api/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LoadCSVComponent = ({ closeModal }) => {
  const [dbFiles, setDbFiles] = React.useState([]);
  const { setCsvData, setFilename, setLoading } = useStore();

  React.useEffect(() => {
    getFileNames();
  }, []);

  const getFileNames = async () => {
    try {
      const result = await apiRequest("GET", `${API_BASE_URL}/files/get-filenames`);
      setDbFiles(result);
    } catch (error) {
      console.error("Error fetching file names:", error);
    }
  };

  const handleDbData = async (e, value) => {
    const str = encodeURIComponent(value);

    if (str) {
      try {
        const result = await apiRequest("GET", `${API_BASE_URL}/files/${str}`);
        setFilename(value);
        closeModal();
        setLoading(true);
        setCsvData(result);
      } catch (error) {
        console.error("Error fetching data from database:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px dashed #ccc",
        borderRadius: "8px",
        mt: 2,
        mb: 3,
      }}
    >
      <DownloadIcon sx={{ fontSize: 40, color: "#213955", mb: 2 }} />
      <Typography id="modal-modal-description" variant="p" component="p" sx={{ mb: 2 }}>
        Select a CSV file from the database.
      </Typography>
      <Box sx={{ maxWidth: 300 }}>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={dbFiles}
          sx={{ width: "100%" }}
          onChange={handleDbData}
          renderInput={(params) => <TextField {...params} label="Files" variant="outlined" />}
        />
      </Box>
    </Box>
  );
};

export default LoadCSVComponent;
