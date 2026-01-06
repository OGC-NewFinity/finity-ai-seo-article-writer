import os
from httpx_oauth.clients.google import GoogleOAuth2
from httpx_oauth.clients.discord import DiscordOAuth2

# OAuth Client IDs and Secrets
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID", "")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET", "")
TWITTER_CLIENT_ID = os.getenv("TWITTER_CLIENT_ID", "")
TWITTER_CLIENT_SECRET = os.getenv("TWITTER_CLIENT_SECRET", "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# OAuth Clients - only create if credentials are provided (and not empty strings)
oauth_clients = {}

if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET and GOOGLE_CLIENT_ID.strip() and GOOGLE_CLIENT_SECRET.strip():
    print(f"✅ Google OAuth client initialized")
    oauth_clients["google"] = GoogleOAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
    )
else:
    print(f"⚠️  Google OAuth not configured (CLIENT_ID: {'set' if GOOGLE_CLIENT_ID else 'missing'}, SECRET: {'set' if GOOGLE_CLIENT_SECRET else 'missing'})")

if DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET and DISCORD_CLIENT_ID.strip() and DISCORD_CLIENT_SECRET.strip():
    print(f"✅ Discord OAuth client initialized")
    oauth_clients["discord"] = DiscordOAuth2(
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
    )
else:
    print(f"⚠️  Discord OAuth not configured (CLIENT_ID: {'set' if DISCORD_CLIENT_ID else 'missing'}, SECRET: {'set' if DISCORD_CLIENT_SECRET else 'missing'})")

# Twitter/X OAuth - Note: httpx-oauth doesn't have a built-in Twitter client
# Twitter OAuth 2.0 requires custom implementation
# For now, Twitter/X OAuth is not supported - would need custom OAuth2 client
# TODO: Implement custom Twitter OAuth2 client if needed
if TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET:
    print("WARNING: Twitter/X OAuth credentials provided but not yet implemented.")
    print("Twitter OAuth requires custom implementation as httpx-oauth doesn't include it.")
