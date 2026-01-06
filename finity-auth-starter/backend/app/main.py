from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.core.config import settings
from app.routes import auth, users
from app.core.database import engine, Base
from app.core.init_admin_user import init_admin_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Finity Auth API",
    description="Authentication and user management API for Finity",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
cors_origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])


@app.on_event("startup")
async def startup_event():
    """Initialize admin user on application startup."""
    logger.info("🚀 Starting application...")
    try:
        init_admin_user()
    except Exception as e:
        logger.error(f"❌ Error during startup: {str(e)}")


@app.get("/")
async def root():
    return {"message": "Finity Auth API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
