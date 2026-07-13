from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import os
import json

from app.models.user import User
from app.core.security_dep import get_admin_user, get_current_user

router = APIRouter(
    prefix="/config",
    tags=["System Configurations"]
)

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "settings.json")

DEFAULT_SETTINGS = {
    "fraud_threshold": 0.50,
    "smtp_host": "smtp.fraudsense-alerts.com",
    "smtp_port": 587,
    "smtp_user": "alerts@fraudsense.com",
    "session_timeout_minutes": 60,
    "security_mode": "HIGH"
}

def load_system_config():
    if not os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "w") as f:
                json.dump(DEFAULT_SETTINGS, f, indent=4)
        except Exception:
            pass
        return DEFAULT_SETTINGS
    try:
        with open(CONFIG_FILE, "r") as f:
            data = json.load(f)
            # Ensure all default keys exist
            for k, v in DEFAULT_SETTINGS.items():
                if k not in data:
                    data[k] = v
            return data
    except Exception:
        return DEFAULT_SETTINGS

def save_system_config(config_data):
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config_data, f, indent=4)
        return True
    except Exception:
        return False

class ConfigInput(BaseModel):
    fraud_threshold: float
    smtp_host: str
    smtp_port: int
    smtp_user: str
    session_timeout_minutes: int
    security_mode: str

@router.get("", status_code=200)
def get_config(current_user: User = Depends(get_current_user)):
    return load_system_config()

@router.put("", status_code=200)
def update_config(payload: ConfigInput, current_user: User = Depends(get_admin_user)):
    config_data = {
        "fraud_threshold": round(payload.fraud_threshold, 2),
        "smtp_host": payload.smtp_host,
        "smtp_port": payload.smtp_port,
        "smtp_user": payload.smtp_user,
        "session_timeout_minutes": payload.session_timeout_minutes,
        "security_mode": payload.security_mode
    }
    
    if config_data["fraud_threshold"] < 0.0 or config_data["fraud_threshold"] > 1.0:
        raise HTTPException(
            status_code=400,
            detail="Fraud threshold must be between 0.0 and 1.0."
        )

    success = save_system_config(config_data)
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to persist configuration settings to disk."
        )
        
    return {
        "success": True,
        "message": "Configurations updated successfully.",
        "config": config_data
    }
