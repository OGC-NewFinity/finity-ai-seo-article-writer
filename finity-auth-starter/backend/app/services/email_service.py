import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings


class EmailService:
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email using SMTP."""
        if not settings.SMTP_HOST:
            print(f"[Email Service] SMTP not configured. Would send to {to_email}: {subject}")
            return False
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = to_email

            if text_content:
                part1 = MIMEText(text_content, "plain")
                msg.attach(part1)
            
            part2 = MIMEText(html_content, "html")
            msg.attach(part2)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"[Email Service] Error sending email: {e}")
            return False

    @staticmethod
    def send_welcome_email(email: str, username: str, verification_token: str) -> bool:
        """Send welcome email with verification link."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to Finity!</h1>
                <p>Hi {username},</p>
                <p>Thank you for creating an account with Finity. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="{verification_url}" class="button">Verify Email</a>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>{verification_url}</p>
                <p>Best regards,<br>The Finity Team</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to Finity!
        
        Hi {username},
        
        Thank you for creating an account with Finity. We're excited to have you on board!
        
        Please verify your email address by visiting this link:
        {verification_url}
        
        Best regards,
        The Finity Team
        """
        
        return EmailService.send_email(
            to_email=email,
            subject="Welcome to Finity - Verify Your Email",
            html_content=html_content,
            text_content=text_content
        )

    @staticmethod
    def send_password_reset_email(email: str, reset_token: str) -> bool:
        """Send password reset email."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .warning {{ color: #dc3545; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Password Reset Request</h1>
                <p>You requested to reset your password for your Finity account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="{reset_url}" class="button">Reset Password</a>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>{reset_url}</p>
                <p class="warning">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>The Finity Team</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        You requested to reset your password for your Finity account.
        
        Visit this link to reset your password:
        {reset_url}
        
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
        
        Best regards,
        The Finity Team
        """
        
        return EmailService.send_email(
            to_email=email,
            subject="Reset Your Finity Password",
            html_content=html_content,
            text_content=text_content
        )

    @staticmethod
    def send_payment_confirmation_email(email: str, username: str, plan_name: str, amount: float) -> bool:
        """Send payment confirmation email."""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .success {{ color: #28a745; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Payment Confirmation</h1>
                <p>Hi {username},</p>
                <p class="success">Your payment has been successfully processed!</p>
                <p><strong>Plan:</strong> {plan_name}</p>
                <p><strong>Amount:</strong> ${amount:.2f}</p>
                <p>Thank you for your subscription. You now have access to all premium features.</p>
                <p>Best regards,<br>The Finity Team</p>
            </div>
        </body>
        </html>
        """
        
        return EmailService.send_email(
            to_email=email,
            subject="Payment Confirmation - Finity",
            html_content=html_content
        )
