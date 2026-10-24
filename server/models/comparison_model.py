# models/comparison_model.py
import json
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class ComparisonModel:
    @staticmethod
    def _load_json_list(value) -> List[str]:
        # aiomysql은 JSON 컬럼을 문자열로 돌려주므로 역직렬화
        if value is None:
            return []
        if isinstance(value, str):
            return json.loads(value)
        return list(value)

    @staticmethod
    def _load_json_object(value) -> Optional[dict]:
        if value is None:
            return None
        if isinstance(value, str):
            return json.loads(value)
        return dict(value)

    @staticmethod
    def _build_placeholders(product_ids: List[str]):
        placeholders = ", ".join(f":id_{i}" for i in range(len(product_ids)))
        params = {f"id_{i}": pid for i, pid in enumerate(product_ids)}
        return placeholders, params

    @staticmethod
    async def _find_foods(session: AsyncSession, product_ids: List[str]) -> List[dict]:
        if not product_ids:
            return []
        placeholders, params = ComparisonModel._build_placeholders(product_ids)
        query = text(f"""
            SELECT report_no, product_name, company_name, product_type, calories, image_url
            FROM active_food_catalog
            WHERE report_no IN ({placeholders})
        """)
        result = await session.execute(query, params)
        by_id = {
            row["report_no"]: {
                "reportNo": row["report_no"],
                "productName": row["product_name"],
                "companyName": row["company_name"],
                "foodCategory": row["product_type"],
                "calories": float(row["calories"] or 0.0),
                "imageUrl": row["image_url"],
            }
            for row in result.mappings().all()
        }
        # 저장된 상품 순서를 유지하고, 삭제된 상품은 건너뜀
        return [by_id[pid] for pid in product_ids if pid in by_id]

    @staticmethod
    async def find_nutrition_rows(session: AsyncSession, product_ids: List[str]) -> List[dict]:
        """건강 점수 계산에 필요한 필드를 product_ids 순서대로 반환한다 (없는 상품은 제외)."""
        if not product_ids:
            return []
        placeholders, params = ComparisonModel._build_placeholders(product_ids)
        query = text(f"""
            SELECT report_no, product_name, company_name, product_type, raw_materials,
                   image_url, calories, carbohydrate, protein, fat,
                   sugars, sodium, saturated_fat
            FROM active_food_catalog
            WHERE report_no IN ({placeholders})
        """)
        result = await session.execute(query, params)
        by_id = {row["report_no"]: dict(row) for row in result.mappings().all()}
        return [by_id[pid] for pid in product_ids if pid in by_id]

    @staticmethod
    async def save_log(
        session: AsyncSession,
        user_id: int,
        product_ids: List[str],
        report: dict,
    ) -> int:
        query = text("""
            INSERT INTO comparison_logs (user_id, product_ids, report)
            VALUES (:user_id, :product_ids, :report)
        """)
        result = await session.execute(query, {
            "user_id": user_id,
            "product_ids": json.dumps(product_ids, ensure_ascii=False),
            "report": json.dumps(report, ensure_ascii=False),
        })
        await session.commit()
        return result.lastrowid

    @staticmethod
    async def _to_log(session: AsyncSession, row) -> dict:
        product_ids = ComparisonModel._load_json_list(row["product_ids"])
        return {
            "comparison_id": row["comparison_id"],
            "user_id": row["user_id"],
            "product_ids": product_ids,
            "foods": await ComparisonModel._find_foods(session, product_ids),
            "report": ComparisonModel._load_json_object(row["report"]),
            "created_at": row["created_at"].isoformat(),
        }

    @staticmethod
    async def find_log(session: AsyncSession, comparison_id: int) -> Optional[dict]:
        query = text("""
            SELECT comparison_id, user_id, product_ids, report, created_at
            FROM comparison_logs
            WHERE comparison_id = :comparison_id
            LIMIT 1
        """)
        result = await session.execute(query, {"comparison_id": comparison_id})
        row = result.mappings().first()
        return await ComparisonModel._to_log(session, row) if row else None

    @staticmethod
    async def find_owned_log(session: AsyncSession, user_id: int, comparison_id: int) -> Optional[dict]:
        # 소유자 조건을 SQL에 포함해 다른 사용자의 로그는 아예 조회되지 않게 함
        query = text("""
            SELECT comparison_id, user_id, product_ids, report, created_at
            FROM comparison_logs
            WHERE comparison_id = :comparison_id AND user_id = :user_id
            LIMIT 1
        """)
        result = await session.execute(query, {"comparison_id": comparison_id, "user_id": user_id})
        row = result.mappings().first()
        return await ComparisonModel._to_log(session, row) if row else None

    @staticmethod
    async def get_logs_by_user(session: AsyncSession, user_id: int) -> List[dict]:
        query = text("""
            SELECT comparison_id, user_id, product_ids, created_at
            FROM comparison_logs
            WHERE user_id = :user_id
            ORDER BY created_at DESC, comparison_id DESC
        """)
        result = await session.execute(query, {"user_id": user_id})
        logs = []
        for row in result.mappings().all():
            product_ids = ComparisonModel._load_json_list(row["product_ids"])
            logs.append({
                "comparison_id": row["comparison_id"],
                "user_id": row["user_id"],
                "product_ids": product_ids,
                "foods": await ComparisonModel._find_foods(session, product_ids),
                "created_at": row["created_at"].isoformat(),
            })
        return logs
