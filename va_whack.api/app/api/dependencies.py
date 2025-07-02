#==============================================================================
# This file contains shared, reusable dependency functions for API endpoints.
# ==============================================================================
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from .. import models
from ..repository import player as player_repo
from ..db.session import get_db
from ..core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Dependency function to get the current authenticated player from a JWT token.
# This is used to protect endpoints and identify the user making the request.
def get_current_player(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT using the secret key and algorithm
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # The player ID is stored in the "sub" (subject) claim of the token
        player_id: str = payload.get("sub")
        if player_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Fetch the player from the database using the ID from the token
    player = player_repo.get_by_id(db, player_id=int(player_id))
    if player is None:
        raise credentials_exception
    return player
