import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import UploadFileModal from "../../utilityComponents/UploadFile/UploadFileModal";
import { useStore } from "../../store";
import Papa from "papaparse";
import { apiRequest } from "../../../api/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function UploadFileScreen() {
    const { setCsvData } = useStore();
    const [openModal, setOpenModal] = useState(false);

    const handleUploadCSV = (event) => {
        const file = event.target.files[0];
        const filename = file.name.split(".")[0];
        const fileType = file.name.split(".").pop().toLowerCase();
        const user_id = localStorage.getItem("userId");

        if (fileType !== "csv") {
            alert("Please upload a CSV file.");
            return;
        }

        Papa.parse(file, {
            complete: (result) => {
                setCsvData(result.data);
                apiRequest("POST", `${API_BASE_URL}/files/add-file`, {
                    filename: filename,
                    data: result.data,
                    added_by: user_id,
                });
            },
            header: true,
        });
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #ccc",
                borderRadius: "8px",
                height: "20rem",
                mx: "30%",
                background: "white",
                mb: 6,
            }}
        >
            <Box display="flex" flexDirection={"column"} alignItems={"center"}>
                <UploadFileIcon sx={{ fontSize: 40, color: "#213955", mb: 1 }} />
                <Typography mb={2} variant="title">
                    Select an option to load CSV
                </Typography>
                <Box display="flex" gap={3}>
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenModal(true)}
                    >
                        Load From Database
                    </Button>
                </Box>
                {openModal && (
                    <UploadFileModal
                        openUploadFileModal={openModal}
                        closeUploadFileModal={() => setOpenModal(false)}
                        setOpenModal={setOpenModal}
                    />
                )}
            </Box>
        </Box>
    );
}

export default UploadFileScreen;
