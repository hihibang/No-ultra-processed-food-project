# schemas/wishlist_schema.py
from typing import Optional

from pydantic import BaseModel, Field


class WishlistCreateRequest(BaseModel):
    # active_food_catalog.report_no (VARCHAR(50))와 동일한 형식
    food_id: str = Field(..., min_length=1, max_length=50)


class WishlistResponse(BaseModel):
    wishlist_id: int
    user_id: int
    food_id: str
    food_details: Optional[dict] = None
