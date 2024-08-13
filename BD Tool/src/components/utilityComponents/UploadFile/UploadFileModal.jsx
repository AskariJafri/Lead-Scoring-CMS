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
  handleUploadCSV,
  setOpenModal,
}) {
  const [dbFiles, setDbFiles] = React.useState([]);
  const { setCsvData, setFilename, setLoading } = useStore();

  React.useEffect(() => {
    getFileNames()
  }, []);

  const getFileNames = async()=>{
    const result = await apiRequest('GET', `${API_BASE_URL}/files/get-filenames`)
    console.log(result)
    setDbFiles(result)
  }
  const handleDbData = async(e, value) => {
    const str = encodeURIComponent(value);

    if (str) {
      try {
        const result = await apiRequest('GET',  `${API_BASE_URL}/files/${str}`)
        setFilename(value);
        setOpenModal(false);
        setLoading(true);
        setCsvData(result)
      }
      catch(error){
        console.log(error)
      }
      finally{
        setLoading(false)
      }
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
