import os
import datetime
from datetime import timedelta
from typing import Optional
import jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

# Load env variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "9a7c36a43bfefd280e7d58b73f27de58ef1c2da010b9a67a07ea3b71f9cf5c2a")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

# -----------------------------------------------------------------------------
# Schemas
# -----------------------------------------------------------------------------
class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="Unique email address of the user")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    full_name: str = Field(..., description="Full name of the user")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Email address of the user")
    password: str = Field(..., description="Password")

class UserOut(BaseModel):
    email: EmailStr
    full_name: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)

# -----------------------------------------------------------------------------
# Dependency
# -----------------------------------------------------------------------------
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token does not contain subject",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Query MongoDB for user
    from backend.database import get_collection
    users_col = get_collection("users")
    user = users_col.find_one({"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User session is invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "email": user["email"],
        "full_name": user["full_name"],
        "created_at": user.get("created_at", "")
    }

# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------
@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Register New User")
def register(user_data: UserRegister):
    from backend.database import get_collection
    users_col = get_collection("users")
    
    # Check duplicate email
    if users_col.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
        
    new_user = {
        "email": user_data.email,
        "hashed_password": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    users_col.insert_one(new_user)
    return {"status": "success", "message": "User account registered successfully."}

@router.post("/login", response_model=Token, summary="Verify Credentials & Return JWT Access Token")
def login(credentials: UserLogin):
    from backend.database import get_collection
    users_col = get_collection("users")
    
    user = users_col.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut, summary="Retrieve Current Logged-In User Details")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
