import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Link } from "react-router-dom";
import robot from "../../../assets/robot.png";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useStore } from "../../store";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: "6px",
  boxShadow: 24,
};

function UploadFileModal({
  openUploadFileModal,
  closeUploadFileModal,
  handleUploadCSV,
  setOpenModal,
}) {
  const [dbFiles, setDbFiles] = React.useState([]);
  const { setCsvData, setFilename, setLoading } = useStore();

  React.useEffect(() => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: new Headers({
        'Content-Type': 'application/json',
        // Add CORS headers as needed
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin (replace '*' with specific origin if needed)
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      }),
    };

    fetch(
      `${API_BASE_URL}/files/get-filenames`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (openUploadFileModal) setDbFiles(result);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleDbData = (e, value) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
      }),
    };
    const str = encodeURIComponent(value);
    // set filename globally
    if (str) {
      setFilename(value);
      setOpenModal(false);
      setLoading(true);
      fetch(
        `${API_BASE_URL}/files/${str}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => setCsvData(result))
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    }
  };
  return (
    <>
      <Modal
        open={openUploadFileModal}
        onClose={closeUploadFileModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            display={"flex"}
            alignItems={"center"}
            sx={{
              backgroundColor: "#213955",
              color: "white",
              fontWeight: 500,
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
              p: 0.5,
            }}
          >
            <img src={robot} alt="robot" height={"60px"} width={"60px"} />
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Load CSV Data
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
            }}
          >
            <Typography id="modal-modal-title" variant="p" component="p">
              Choose mode of CSV uplaod.
            </Typography>
            <Box sx={{ maxWidth: 220, pt: 1.5 }}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={dbFiles}
                sx={{ width: 300 }}
                onChange={handleDbData}
                renderInput={(params) => (
                  <TextField {...params} label="Files" />
                )}
              />
            </Box>
            <Box display="flex" justifyContent={"flex-end"}>
              <Button
                variant="contained"
                color="primary"
                endIcon={<AddCircleOutlineIcon />}
                component="label"
                // component={Link}
                // to="/generate-icp"
              >
                Upload
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleUploadCSV}
                  hidden
                />
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default UploadFileModal;
