# ==============================================================================
# This file defines the API endpoints for authentication (login).
# va_whack.api\app\api\endpoints\auth_api.py
# ==============================================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import secrets

from ...schemas import schemas
from ...repository import player_repo, pin_repo
from ...db.session import get_db
from ...services import email_service
from ...core.config import settings
from ...core import security

router = APIRouter()

@router.post("/request-pin")
def request_login_pin(request: schemas.PinRequest, db: Session = Depends(get_db)):
    player = player_repo.get_by_email(db, email=request.email)
    if not player:
        raise HTTPException(status_code=404, detail="Player with this email not found.")
    
    if not player.is_verified:
        raise HTTPException(status_code=400, detail="Player account is not verified. Please verify registration first.")

    pin_repo.expire_all_active_for_email(db=db, email=request.email)

    pin = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.PIN_EXPIRATION_MINUTES)
    pin_repo.create(db=db, email=request.email, pin=pin, expires_at=expires_at)

    email_service.send_verification_pin(recipient_email=request.email, pin=pin)

    return {"message": "A login PIN has been sent to your email."}


@router.post("/token", response_model=schemas.Token)
def login_with_pin(request: schemas.TokenRequest, db: Session = Depends(get_db)):
    pin_record = pin_repo.get_active(db=db, email=request.email, pin=request.pin)

    if not pin_record:
        raise HTTPException(status_code=400, detail="Invalid PIN")

    if datetime.now(timezone.utc) > pin_record.expires_at:
        pin_repo.expire(db=db, pin=pin_record)
        raise HTTPException(status_code=400, detail="PIN has expired")

    player = player_repo.get_by_email(db, email=request.email)
    if not player or not player.is_verified:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    pin_repo.use(db=db, pin=pin_record)
    
    # Create JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(player.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token,   "name":player.name, "ageGroup": player.age_group}
