from pydantic import BaseModel
from typing import List, Optional

class RecipeItem(BaseModel):
    recipe_id: int
    menu_name: str
    cooking_method: Optional[str] = None
    recipe_type: Optional[str] = None
    calories: float
    sodium: float
    ingredients: str
    cooking_steps_desc: Optional[str] = None

class RecipeResponse(BaseModel):
    count: int
    recipes: List[RecipeItem]