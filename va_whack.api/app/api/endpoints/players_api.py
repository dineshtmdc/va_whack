# ==============================================================================
# This file defines the API endpoints related to player management.
# This includes registration and initial one-time PIN verification.
# va_whack.api\app\api\endpoints\players_api.py
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timezone, timedelta

from ...schemas import schemas
from ...repository import player_repo, pin_repo
from ...db.session import get_db
from ...services import email_service
from ...core.config import settings
from ...core import security

router = APIRouter()

@router.post("/register", response_model=schemas.PlayerRegisterResponse, status_code=201)
def register_player(player_in: schemas.PlayerRegisterRequest, db: Session = Depends(get_db)):
    db_player = player_repo.get_by_email(db, email=player_in.email)
    if db_player:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_player = player_repo.create(db=db, player=player_in)

    pin = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.PIN_EXPIRATION_MINUTES)
    pin_repo.create(db=db, email=player_in.email, pin=pin, expires_at=expires_at)

    email_service.send_verification_pin(user_name=new_player.name, recipient_email=player_in.email, pin=pin)

    return new_player

@router.post("/verify", response_model=schemas.Token)
def verify_player_registration(pin_in: schemas.PinVerify, db: Session = Depends(get_db)):
    pin_record = pin_repo.get_active(db=db, email=pin_in.email, pin=pin_in.pin)

    if not pin_record:
        raise HTTPException(status_code=400, detail="Invalid PIN")

    if datetime.now(timezone.utc) > pin_record.expires_at:
        pin_repo.expire(db=db, pin=pin_record)
        raise HTTPException(status_code=400, detail="PIN has expired")

    player = player_repo.get_by_email(db, email=pin_in.email)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if player.is_verified:
        raise HTTPException(status_code=400, detail="Player is already verified.")

    player_repo.verify(db=db, player=player)
    pin_repo.use(db=db, pin=pin_record)
    
    # Automatically log the player in by creating and returning a JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(player.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "name":player.name, "ageGroup": player.age_group}
