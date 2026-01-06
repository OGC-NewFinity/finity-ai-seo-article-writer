import httpx
from typing import Optional, Dict
from app.core.config import settings


class OAuthService:
    @staticmethod
    async def get_google_user_info(access_token: str) -> Optional[Dict]:
        """Get user info from Google using access token."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "email": data.get("email"),
                        "name": data.get("name"),
                        "picture": data.get("picture"),
                        "provider_user_id": data.get("id")
                    }
            except Exception as e:
                print(f"[OAuth] Google error: {e}")
        return None

    @staticmethod
    async def get_facebook_user_info(access_token: str) -> Optional[Dict]:
        """Get user info from Facebook using access token."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "https://graph.facebook.com/me",
                    params={
                        "fields": "id,name,email,picture",
                        "access_token": access_token
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "email": data.get("email"),
                        "name": data.get("name"),
                        "picture": data.get("picture", {}).get("data", {}).get("url") if data.get("picture") else None,
                        "provider_user_id": data.get("id")
                    }
            except Exception as e:
                print(f"[OAuth] Facebook error: {e}")
        return None

    @staticmethod
    async def get_discord_user_info(access_token: str) -> Optional[Dict]:
        """Get user info from Discord using access token."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "https://discord.com/api/users/@me",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "email": data.get("email"),
                        "name": data.get("username"),
                        "picture": f"https://cdn.discordapp.com/avatars/{data.get('id')}/{data.get('avatar')}.png" if data.get("avatar") else None,
                        "provider_user_id": data.get("id")
                    }
            except Exception as e:
                print(f"[OAuth] Discord error: {e}")
        return None

    @staticmethod
    async def get_twitter_user_info(access_token: str) -> Optional[Dict]:
        """Get user info from X (Twitter) using access token."""
        async with httpx.AsyncClient() as client:
            try:
                # Twitter API v2 requires bearer token
                response = await client.get(
                    "https://api.twitter.com/2/users/me",
                    params={"user.fields": "profile_image_url,email"},
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if response.status_code == 200:
                    data = response.json()
                    user_data = data.get("data", {})
                    return {
                        "email": user_data.get("email"),
                        "name": user_data.get("name"),
                        "picture": user_data.get("profile_image_url"),
                        "provider_user_id": user_data.get("id")
                    }
            except Exception as e:
                print(f"[OAuth] Twitter error: {e}")
        return None

    @staticmethod
    def get_oauth_authorization_url(provider: str) -> Optional[str]:
        """Get OAuth authorization URL for a provider."""
        base_urls = {
            "google": "https://accounts.google.com/o/oauth2/v2/auth",
            "facebook": "https://www.facebook.com/v18.0/dialog/oauth",
            "discord": "https://discord.com/api/oauth2/authorize",
            "twitter": "https://twitter.com/i/oauth2/authorize"
        }
        
        client_ids = {
            "google": settings.GOOGLE_CLIENT_ID,
            "facebook": settings.FACEBOOK_CLIENT_ID,
            "discord": settings.DISCORD_CLIENT_ID,
            "twitter": settings.TWITTER_CLIENT_ID
        }
        
        redirect_uris = {
            "google": f"{settings.BACKEND_URL}/api/auth/social/google/callback",
            "facebook": f"{settings.BACKEND_URL}/api/auth/social/facebook/callback",
            "discord": f"{settings.BACKEND_URL}/api/auth/social/discord/callback",
            "twitter": f"{settings.BACKEND_URL}/api/auth/social/twitter/callback"
        }
        
        scopes = {
            "google": "openid email profile",
            "facebook": "email",
            "discord": "identify email",
            "twitter": "tweet.read users.read"
        }
        
        if provider not in base_urls or not client_ids[provider]:
            return None
        
        import urllib.parse
        params = {
            "client_id": client_ids[provider],
            "redirect_uri": redirect_uris[provider],
            "response_type": "code",
            "scope": scopes[provider]
        }
        
        if provider == "google":
            params["access_type"] = "offline"
            params["prompt"] = "consent"
        elif provider == "twitter":
            params["code_challenge"] = "challenge"
            params["code_challenge_method"] = "plain"
        
        return f"{base_urls[provider]}?{urllib.parse.urlencode(params)}"
