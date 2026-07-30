from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings


async def send_email(to: str, subject: str, text: str) -> None:
    """Send an email via SMTP. Gracefully handles failures — never crashes the app."""
    if not settings.SMTP_USERNAME and not settings.SMTP_PASSWORD:
        # Dev mode — no auth needed (e.g., Mailhog)
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
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to}: {e}")
        # Don't crash the app
