# ==============================================================================
# This file contains data access logic for the PinNumber model.
# va_whack.api\app\repository\pin_repo.py
# ==============================================================================

from sqlalchemy.orm import Session
from datetime import datetime
from ..models import models

# ==============================================================================
# Creates a new PIN record in the database.
# ==============================================================================
def create(db: Session, email: str, pin: str, expires_at: datetime):
    db_pin = models.PinNumber(email=email, pin=pin, expires_at=expires_at)
    db.add(db_pin)
    db.commit()
    db.refresh(db_pin)
    return db_pin

# ==============================================================================
# Retrieves an active PIN that matches the provided email and pin value.
# ==============================================================================
def get_active(db: Session, email: str, pin: str):
    return db.query(models.PinNumber).filter(
        models.PinNumber.email == email,
        models.PinNumber.pin == pin,
        models.PinNumber.status == models.PinStatus.ACTIVE
    ).first()

# ==============================================================================
# Marks a specific PIN record as expired.
# ==============================================================================
def expire(db: Session, pin: models.PinNumber):
    pin.status = models.PinStatus.EXPIRED
    db.commit()

# ==============================================================================
# Marks a specific PIN record as used.
# ==============================================================================
def use(db: Session, pin: models.PinNumber):
    pin.status = models.PinStatus.USED
    db.commit()

# ==============================================================================
# Expires all currently active PINs for a given email address.
# This is used when a new PIN is requested to invalidate old ones.
# ==============================================================================
def expire_all_active_for_email(db: Session, email: str):
    db.query(models.PinNumber).filter(
        models.PinNumber.email == email,
        models.PinNumber.status == models.PinStatus.ACTIVE
    ).update({"status": models.PinStatus.EXPIRED})
    db.commit()