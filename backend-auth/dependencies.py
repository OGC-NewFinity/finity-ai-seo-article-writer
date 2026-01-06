from fastapi import Depends, HTTPException, status
from db import User
from users import current_active_user


async def admin_required(current_user: User = Depends(current_active_user)) -> User:
    """
    Dependency that ensures the current user has admin role.
    Raises 403 Forbidden if user is not an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
