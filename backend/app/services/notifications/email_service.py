import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger("email")


async def send_email(to: str, subject: str, text: str) -> None:
    """Send an email via SMTP. Gracefully handles failures — never crashes the app."""
    logger.info("Sending email to=%s subject=%s", to, subject)

    if not settings.SMTP_USERNAME and not settings.SMTP_PASSWORD:
        # Dev mode — no auth needed (e.g., Mailhog)
        logger.debug("SMTP auth disabled (dev mode)")
        pass

    msg = EmailMessage()
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text)

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME or None,
            password=settings.SMTP_PASSWORD or None,
            use_tls=settings.SMTP_USE_TLS,
        )
        logger.debug("Email sent successfully to=%s", to)
    except Exception as e:
        logger.error("Failed to send email to=%s: %s", to, e)
        # Don't crash the app
