from fastapi import APIRouter,Body, Request, status,Depends,HTTPException
from ScoringFunctions.functions import score_leads
from PreprocessingFunctions.functions import map_company_size
from src.rules import file as files
from src.models.file import File
from typing import List
from urllib.parse import unquote  # Import unquote for decoding URL-encoded strings


router = APIRouter(prefix="/files",tags=["File"])

@router.post("/add-file",response_description='Add a new file', status_code=status.HTTP_201_CREATED, response_model=File)
def add_file( request:Request, file:File=Body(...)):
    return files.add_file(request,file)

@router.post("/add-score",response_description='Add a new scored file', status_code=status.HTTP_201_CREATED, response_model=File)
def add_file( request:Request, file:File=Body(...)):
    return files.add_score(request,file)


@router.get("/get-filenames", response_description='List users')
def list_filenames(request:Request):
    return files.list_filenames(request)


@router.get("/{filename}", response_description='Get a file')
def find_file_by_filename(request: Request, filename: str):
    try:
        decoded_filename = unquote(filename)
        file = files.find_file_by_filename(request, decoded_filename)
        
        if file:
            return file
        else:
            raise HTTPException(status_code=404, detail=f"File with filename {decoded_filename} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/score-leads")
async def score_leads_endpoint(
    request: Request,
    payload: dict,
    current_user: dict = Depends(files.get_current_user)
):
    try:
        data_json = payload["data_json"]
        icp_json = payload["icp_json"]
        scoring_weights = payload["scoring_weights"]
        for entry in data_json:
            if "Employees Size" in entry:
                entry["Employees Size"] = map_company_size(entry["Employees Size"])

        scored_leads = score_leads(data_json, icp_json, scoring_weights)
        
        return files.add_score(request,file)

    except Exception as e:
        return {"error": str(e)}
