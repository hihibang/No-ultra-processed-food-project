from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.food_routes import router as food_router

app = FastAPI(
    title="UPF Identifier API",
    description="초가공식품(UPF) 판별 및 건강 대체 레시피 추천 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(food_router)

@app.get("/")
async def root():
    return {"message": "Food UPF Classifier API is active"}