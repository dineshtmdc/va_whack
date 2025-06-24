# ==============================================================================
# This file defines the API endpoints related to player management.
# This includes registration and PIN verification.
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import secrets
import datetime

from ... import schemas
from ...repository import player as player_repo, pin as pin_repo
from ...db.session import get_db
from ...services import email_service
from ...core.config import settings

router = APIRouter()

@router.post("/register", response_model=schemas.PlayerRead, status_code=201)
def register_player(player_in: schemas.PlayerCreate, db: Session = Depends(get_db)):
    db_player = player_repo.get_by_email(db, email=player_in.email)
    if db_player:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_player = player_repo.create(db=db, player=player_in)

    pin = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.PIN_EXPIRATION_MINUTES)
    pin_repo.create(db=db, email=player_in.email, pin=pin, expires_at=expires_at)

    email_service.send_verification_pin(recipient_email=player_in.email, pin=pin)

    return new_player


@router.post("/verify")
def verify_player_pin(pin_in: schemas.PinVerify, db: Session = Depends(get_db)):
    pin_record = pin_repo.get_active(db=db, email=pin_in.email, pin=pin_in.pin)

    if not pin_record:
        raise HTTPException(status_code=400, detail="Invalid PIN")

    if datetime.datetime.utcnow() > pin_record.expires_at:
        pin_repo.expire(db=db, pin=pin_record)
        raise HTTPException(status_code=400, detail="PIN has expired")

    player = player_repo.get_by_email(db, email=pin_in.email)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player_repo.verify(db=db, player=player)
    pin_repo.use(db=db, pin=pin_record)
    
    return {"message": "Player verified successfully"}


@router.post("/resend-pin")
def resend_verification_pin(request: schemas.PinResendRequest, db: Session = Depends(get_db)):
    player = player_repo.get_by_email(db, email=request.email)
    if not player:
        raise HTTPException(status_code=404, detail="Player with this email not found.")
    
    if player.is_verified:
        raise HTTPException(status_code=400, detail="Player is already verified.")

    pin_repo.expire_all_active_for_email(db=db, email=request.email)

    pin = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.PIN_EXPIRATION_MINUTES)
    pin_repo.create(db=db, email=request.email, pin=pin, expires_at=expires_at)

    email_service.send_verification_pin(recipient_email=request.email, pin=pin)

    return {"message": "A new verification PIN has been sent."}
