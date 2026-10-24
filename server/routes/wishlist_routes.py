# routes/wishlist_routes.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.wishlist_model import WishlistModel
from schemas.wishlist_schema import WishlistCreateRequest, WishlistResponse
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


@router.get("", response_model=List[WishlistResponse])
async def get_wishlist(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await WishlistModel.get_user_wishlist(db, current_user["user_id"])


@router.post("", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def add_wishlist(
    body: WishlistCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = current_user["user_id"]

    if not await WishlistModel.food_exists(db, body.food_id):
        raise HTTPException(status_code=404, detail="존재하지 않는 식품입니다.")

    try:
        wishlist_id = await WishlistModel.add_wishlist(db, user_id, body.food_id)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="이미 찜한 상품입니다.")

    return WishlistResponse(
        wishlist_id=wishlist_id,
        user_id=user_id,
        food_id=body.food_id,
    )


@router.delete("/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_wishlist(
    food_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await WishlistModel.remove_wishlist(db, current_user["user_id"], food_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="찜 목록에 없는 상품입니다.")
