import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

# SMTP Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAILS_FROM_EMAIL = os.getenv("EMAILS_FROM_EMAIL", SMTP_USERNAME)
EMAILS_FROM_NAME = os.getenv("EMAILS_FROM_NAME", "Finity Support")
EMAILS_ENABLED = os.getenv("EMAILS_ENABLED", "true").lower() == "true"

# Frontend URL for email links
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
) -> bool:
    """
    Send an email using SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email body
        text_content: Plain text email body (optional)
    
    Returns:
        True if email was sent successfully, False otherwise
    """
    if not EMAILS_ENABLED:
        print(f"[EMAIL DISABLED] Would send email to {to_email}: {subject}")
        return True
    
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[EMAIL ERROR] SMTP credentials not configured. Cannot send email to {to_email}")
        return False
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = f"{EMAILS_FROM_NAME} <{EMAILS_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add text and HTML parts
        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email
        print(f"📧 Attempting to send email via SMTP...")
        smtp_response = await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
            use_tls=True,
        )
        
        print(f"[EMAIL SENT] Successfully sent email to {to_email}: {subject}")
        print(f"   SMTP Response: {smtp_response}")
        return True
        
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {str(e)}")
        import traceback
        print(f"   Traceback: {traceback.format_exc()}")
        return False


async def send_verification_email(email: str, token: str) -> bool:
    """Send email verification email."""
    print(f"📤 Sending verification email to {email}")
    print(f"   Token: {token[:20]}...")
    print(f"   SMTP Host: {SMTP_HOST}")
    print(f"   SMTP Port: {SMTP_PORT}")
    print(f"   SMTP Username: {SMTP_USERNAME}")
    print(f"   SMTP Password: {'*' * len(SMTP_PASSWORD) if SMTP_PASSWORD else 'NOT SET'}")
    print(f"   Emails Enabled: {EMAILS_ENABLED}")
    
    verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .button:hover {{ background-color: #1d4ed8; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
            <a href="{verification_url}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="{verification_url}">{verification_url}</a></p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Verify Your Email Address
    
    Thank you for registering! Please verify your email address by visiting:
    {verification_url}
    
    If you didn't create an account, you can safely ignore this email.
    This link will expire in 24 hours.
    """
    
    result = await send_email(
        to_email=email,
        subject="Verify Your Email Address",
        html_content=html_content,
        text_content=text_content,
    )
    
    if result:
        print(f"✅ Verification email sent successfully to {email}")
    else:
        print(f"❌ Failed to send verification email to {email}")
    
    return result


async def send_password_reset_email(email: str, token: str) -> bool:
    """Send password reset email."""
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .button:hover {{ background-color: #1d4ed8; }}
            .warning {{ color: #dc2626; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="{reset_url}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="{reset_url}">{reset_url}</a></p>
            <p class="warning">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>This link will expire in 1 hour.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Reset Your Password
    
    You requested to reset your password. Visit the following link to create a new password:
    {reset_url}
    
    If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    This link will expire in 1 hour.
    """
    
    return await send_email(
        to_email=email,
        subject="Reset Your Password",
        html_content=html_content,
        text_content=text_content,
    )
