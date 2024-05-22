from fastapi import Depends, HTTPException, status, APIRouter, Request,Body
from fastapi.security import OAuth2PasswordBearer
from jose import  jwt
from dotenv import dotenv_values
from ScoringFunctions.functions import score_leads
from PreprocessingFunctions.functions import map_company_size
from fastapi.encoders import jsonable_encoder
from bson import ObjectId


config = dotenv_values(".env")
algorithm=config["ALGORITHM"]
secret_key=config["SECRET_KEY"]

# Define the OAuth2 password bearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Define a dependency to verify JWT token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Decode and verify the JWT token
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        # Extract user information from the payload if needed
        # user_id = payload.get("sub")
        # username = payload.get("username")
        # You can return user information if required
        return payload
    except jwt.JWTError:
        # If token verification fails, raise an HTTPException
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_collection_files(request:Request):
    return request.app.database["Files"]

def get_collection_scores(request:Request):
    return request.app.database["Scores"]

def add_file(request: Request, file = Body(...)):
    files = jsonable_encoder(file)
    all_files=list(get_collection_files(request).find({"filename":files["filename"]}))
    filenames = [filename["filename"] for filename in all_files]
    if files["filename"] in filenames:
        raise HTTPException(status_code=status.HTTP_417_EXPECTATION_FAILED, detail=f"user with this username already exists!")
    new_file_obj = get_collection_files(request).insert_one(files)
    created_file = get_collection_files(request).find_one({"_id":new_file_obj.inserted_id})
    return created_file

def list_filenames(request: Request):
    all_files = list(get_collection_files(request).find())
    filenames = [file["filename"] for file in all_files]
    return filenames

def find_file_by_filename(request: Request, filename: str):
    file = get_collection_files(request).find_one({"filename": filename})
    # print(file)
     # Remove the _id field from the file object
    file.pop('_id', None)
    return file["data"]

def add_score(request: Request, file = Body(...)):
    files = jsonable_encoder(file)
    new_file_obj = get_collection_scores(request).insert_one(files)
    created_file = get_collection_scores(request).find_one({"_id":new_file_obj.inserted_id})
    return created_file