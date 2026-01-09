"""
Discord OAuth2 Service
Handles Discord OAuth2 authentication flow with manual token exchange and user info fetching.
"""
import os
import httpx
from typing import Dict, Optional, Tuple
from urllib.parse import urlencode


class DiscordOAuthService:
    """Custom Discord OAuth2 service with explicit token exchange and user info fetching"""
    
    DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token"
    DISCORD_USER_URL = "https://discord.com/api/users/@me"
    DISCORD_AUTHORIZE_URL = "https://discord.com/api/oauth2/authorize"
    
    def __init__(
        self,
        client_id: str,
        client_secret: str,
        redirect_uri: str,
        scope: str = "identify email"
    ):
        """
        Initialize Discord OAuth service
        
        Args:
            client_id: Discord application client ID
            client_secret: Discord application client secret
            redirect_uri: OAuth redirect URI (must match Discord Developer Portal)
            scope: OAuth scopes (default: "identify email")
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.scope = scope
    
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """
        Generate Discord authorization URL
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            Authorization URL
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": self.scope,
        }
        
        if state:
            params["state"] = state
        
        return f"{self.DISCORD_AUTHORIZE_URL}?{urlencode(params)}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, any]:
        """
        Exchange authorization code for access token
        
        Args:
            code: Authorization code from Discord callback
            
        Returns:
            Dictionary containing access_token, token_type, expires_in, refresh_token, scope
            
        Raises:
            httpx.HTTPStatusError: If token exchange fails
            ValueError: If response is invalid
        """
        if not code or not code.strip():
            raise ValueError("Authorization code is required")
        
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
            "scope": self.scope,
        }
        
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.DISCORD_TOKEN_URL,
                    data=data,
                    headers=headers,
                    timeout=10.0
                )
                response.raise_for_status()
                
                token_data = response.json()
                
                # Validate response contains required fields
                if "access_token" not in token_data:
                    raise ValueError("Discord token response missing access_token")
                
                # Do not log sensitive tokens
                print(f"✅ Discord token exchange successful")
                print(f"   Token type: {token_data.get('token_type', 'N/A')}")
                print(f"   Expires in: {token_data.get('expires_in', 'N/A')} seconds")
                
                return token_data
                
            except httpx.HTTPStatusError as e:
                error_msg = f"Discord token exchange failed: {e.response.status_code}"
                if e.response.status_code == 400:
                    try:
                        error_data = e.response.json()
                        error_msg += f" - {error_data.get('error_description', 'Invalid request')}"
                    except:
                        pass
                print(f"❌ {error_msg}")
                raise
            except httpx.RequestError as e:
                error_msg = f"Discord token exchange request failed: {str(e)}"
                print(f"❌ {error_msg}")
                raise
    
    async def get_user_info(self, access_token: str) -> Dict[str, any]:
        """
        Fetch Discord user information
        
        Args:
            access_token: Discord access token
            
        Returns:
            Dictionary containing user info (id, username, email, avatar, etc.)
            
        Raises:
            httpx.HTTPStatusError: If request fails
            ValueError: If response is invalid
        """
        if not access_token or not access_token.strip():
            raise ValueError("Access token is required")
        
        headers = {
            "Authorization": f"Bearer {access_token}",
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.DISCORD_USER_URL,
                    headers=headers,
                    timeout=10.0
                )
                response.raise_for_status()
                
                user_data = response.json()
                
                # Validate required fields
                required_fields = ["id", "username"]
                missing_fields = [field for field in required_fields if field not in user_data]
                if missing_fields:
                    raise ValueError(f"Discord user response missing required fields: {missing_fields}")
                
                # Extract and validate fields
                discord_id = str(user_data.get("id", ""))
                username = user_data.get("username", "")
                email = user_data.get("email")  # May be None if email scope not granted
                avatar = user_data.get("avatar")  # May be None
                discriminator = user_data.get("discriminator", "0")
                
                if not discord_id:
                    raise ValueError("Discord user ID is empty")
                
                if not username:
                    raise ValueError("Discord username is empty")
                
                print(f"✅ Discord user info retrieved")
                print(f"   ID: {discord_id}")
                print(f"   Username: {username}")
                print(f"   Email: {email if email else 'Not provided'}")
                print(f"   Avatar: {'Present' if avatar else 'Not provided'}")
                
                return {
                    "id": discord_id,
                    "username": username,
                    "email": email,
                    "avatar": avatar,
                    "discriminator": discriminator,
                    "raw_data": user_data,  # Store full response for future use
                }
                
            except httpx.HTTPStatusError as e:
                error_msg = f"Discord user info request failed: {e.response.status_code}"
                if e.response.status_code == 401:
                    error_msg += " - Invalid or expired access token"
                print(f"❌ {error_msg}")
                raise
            except httpx.RequestError as e:
                error_msg = f"Discord user info request error: {str(e)}"
                print(f"❌ {error_msg}")
                raise
    
    async def get_id_email(self, access_token: str) -> Tuple[str, str]:
        """
        Get Discord user ID and email (compatibility method for existing code)
        
        Args:
            access_token: Discord access token
            
        Returns:
            Tuple of (user_id, email)
            
        Raises:
            ValueError: If email is not available
        """
        user_info = await self.get_user_info(access_token)
        discord_id = user_info["id"]
        email = user_info["email"]
        
        if not email:
            raise ValueError("Discord user email not available. Ensure 'email' scope is requested.")
        
        return (discord_id, email)
