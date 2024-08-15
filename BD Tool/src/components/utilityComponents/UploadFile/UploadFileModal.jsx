import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import robot from "../../../assets/robot.png";
import { useStore } from "../../store";
import { apiRequest } from "../../../api/api";

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
  setOpenModal,
}) {
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
        setOpenModal(false);
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
    <Modal
      open={openUploadFileModal}
      onClose={closeUploadFileModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            backgroundColor: "#213955",
            color: "white",
            fontWeight: 500,
            borderTopLeftRadius: "6px",
            borderTopRightRadius: "6px",
            p: 0.5,
            position: "relative",
          }}
        >
          <Box display={"flex"} alignItems={"center"}>
            <img src={robot} alt="robot" height={"60px"} width={"60px"} />
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Load CSV Data
            </Typography>
          </Box>

          <div>
            <IconButton
              aria-label="close"
              onClick={closeUploadFileModal}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white",
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>

        </Box>
        <Box
          sx={{
            p: 2,
          }}
        >
          <Typography id="modal-modal-description" variant="p" component="p">
            Choose mode of CSV upload.
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
        </Box>
      </Box>
    </Modal>
  );
}

export default UploadFileModal;
