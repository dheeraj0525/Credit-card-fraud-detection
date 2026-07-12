import logging

logger = logging.getLogger("fraudsense")

class AlertService:
    def send_fraud_alert(self, transaction_id: int, risk_level: str):
        # Placeholder for notification systems (e.g. Email, SMS, Slack webhook)
        logger.warning(f"⚠️ [ALERT] High risk transaction detected! ID: {transaction_id}, Risk: {risk_level}")

alert_service = AlertService()