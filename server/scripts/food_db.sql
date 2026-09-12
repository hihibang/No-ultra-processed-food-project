-- 1. 데이터베이스 생성 및 선택
CREATE DATABASE IF NOT EXISTS food_db 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE food_db;


-- ========================================================
-- 1. 전국통합식품영양성분정보 (가공식품 영양 정보 마스터)
-- ========================================================
CREATE TABLE IF NOT EXISTS food_nutrition (
    report_no VARCHAR(50) NOT NULL COMMENT '품목제조보고번호 (itemMnftrRptNo)',
    food_code VARCHAR(50) NULL COMMENT '식품코드',
    food_name VARCHAR(255) NOT NULL COMMENT '식품명',
    manufacturer VARCHAR(150) NULL COMMENT '제조사명',
    category_large VARCHAR(100) NULL COMMENT '식품대분류명',
    category_small VARCHAR(100) NULL COMMENT '식품소분류명',
    serving_size VARCHAR(50) NULL COMMENT '영양성분함량 기준량',
    total_weight VARCHAR(50) NULL COMMENT '식품중량',
    
    -- 기본 영양 성분
    calories DECIMAL(8, 2) DEFAULT 0.00 COMMENT '에너지(kcal)',
    carbohydrate DECIMAL(8, 2) DEFAULT 0.00 COMMENT '탄수화물(g)',
    protein DECIMAL(8, 2) DEFAULT 0.00 COMMENT '단백질(g)',
    fat DECIMAL(8, 2) DEFAULT 0.00 COMMENT '지방(g)',
    
    -- 주의/핵심 영양 성분
    sugars DECIMAL(8, 2) DEFAULT 0.00 COMMENT '당류(g)',
    sodium DECIMAL(8, 2) DEFAULT 0.00 COMMENT '나트륨(mg)',
    saturated_fat DECIMAL(8, 2) DEFAULT 0.00 COMMENT '포화지방산(g)',
    trans_fat DECIMAL(8, 2) DEFAULT 0.00 COMMENT '트랜스지방산(g)',
    cholesterol DECIMAL(8, 2) DEFAULT 0.00 COMMENT '콜레스테롤(mg)',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (report_no),
    INDEX idx_nutrition_food_name (food_name)
) ENGINE=InnoDB COMMENT='가공식품 영양성분 마스터';


-- ========================================================
-- 2. 식품(첨가물)품목제조보고 (제품 마스터)
-- 원재료/첨가물 목록은 쉼표(,) 구분 단일 컬럼으로 관리
-- ========================================================
CREATE TABLE IF NOT EXISTS food_product (
    report_no VARCHAR(50) NOT NULL COMMENT '품목제조번호 (PRDLST_REPORT_NO)',
    license_no VARCHAR(50) NULL COMMENT '인허가번호',
    company_name VARCHAR(150) NULL COMMENT '업소명',
    product_name VARCHAR(255) NOT NULL COMMENT '품목명',
    product_type VARCHAR(100) NULL COMMENT '품목유형명',
    raw_materials TEXT NULL COMMENT '원재료 및 첨가물 (쉼표 구분)',
    report_date DATE NULL COMMENT '보고일자',
    change_date VARCHAR(8) NULL COMMENT '변경일자 (YYYYMMDD, 증분 수집 필터링 키)',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (report_no),
    INDEX idx_product_name (product_name),
    INDEX idx_company_name (company_name),
    INDEX idx_change_date (change_date)
) ENGINE=InnoDB COMMENT='식품 품목제조보고 마스터';


-- ========================================================
-- 3. 식품첨가물공전 (첨가물 사전/마스터)
-- ========================================================
CREATE TABLE IF NOT EXISTS food_additive_standard (
    additive_code VARCHAR(50) NOT NULL COMMENT '품목코드',
    additive_name VARCHAR(255) NOT NULL COMMENT '품목한글명',
    detail_item_name VARCHAR(255) NULL COMMENT '세부항목명',
    standard_summary TEXT NULL COMMENT '기준규격값 요약',
    is_hazard TINYINT(1) DEFAULT 0 COMMENT '위해여부 (1: 위해/주의, 0: 일반)',
    valid_start_date DATE NULL COMMENT '유효개시일자',
    valid_end_date DATE NULL COMMENT '유효종료일자',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (additive_code),
    INDEX idx_additive_name (additive_name)
) ENGINE=InnoDB COMMENT='식품첨가물공전 마스터 사전';


-- ========================================================
-- 4. 조리식품 레시피 DB (이미지 컬럼 제외, 순수 텍스트 전용)
-- 조리과정은 쉼표(,) 구분 단일 컬럼으로 관리
-- ========================================================
CREATE TABLE IF NOT EXISTS recipe (
    recipe_id BIGINT NOT NULL COMMENT '일련번호 (RCP_SEQ)',
    menu_name VARCHAR(255) NOT NULL COMMENT '메뉴명',
    cooking_method VARCHAR(100) NULL COMMENT '조리방법',
    recipe_type VARCHAR(100) NULL COMMENT '요리종류',
    serving_weight VARCHAR(50) NULL COMMENT '중량(1인분)',
    ingredients TEXT NOT NULL COMMENT '재료정보',
    
    -- 영양 성분 정보
    calories DECIMAL(8, 2) DEFAULT 0.00 COMMENT '열량(kcal)',
    carbohydrate DECIMAL(8, 2) DEFAULT 0.00 COMMENT '탄수화물(g)',
    protein DECIMAL(8, 2) DEFAULT 0.00 COMMENT '단백질(g)',
    fat DECIMAL(8, 2) DEFAULT 0.00 COMMENT '지방(g)',
    sodium DECIMAL(8, 2) DEFAULT 0.00 COMMENT '나트륨(mg)',
    
    -- 만드는 법 (01~20 순서, 쉼표 구분)
    cooking_steps_desc MEDIUMTEXT NULL COMMENT '만드는 법 01~20 순서 (쉼표 구분)',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (recipe_id),
    INDEX idx_recipe_menu (menu_name),
    INDEX idx_recipe_type (recipe_type)
) ENGINE=InnoDB COMMENT='조리식품 레시피 정보 (텍스트 전용)';


-- ========================================================
-- 5. 1-2번 결합 VIEW (2번 food_product 기준 RIGHT JOIN)
-- 2번 제품 데이터를 누락 없이 보존하고 1번 영양성분을 매핑
-- ========================================================
CREATE OR REPLACE VIEW view_food_product_detail AS
SELECT 
    -- 2번 기준 제품 기본 정보
    p.report_no,
    p.product_name,
    p.company_name,
    p.product_type,
    p.raw_materials,
    p.report_date,
    p.change_date,
    
    -- 1번 영양 정보 (매핑 데이터 없으면 NULL 표기)
    n.food_code,
    n.category_large,
    n.category_small,
    n.serving_size,
    n.total_weight,
    n.calories,
    n.carbohydrate,
    n.protein,
    n.fat,
    n.sugars,
    n.sodium,
    n.saturated_fat,
    n.trans_fat,
    n.cholesterol
FROM food_nutrition n
RIGHT JOIN food_product p 
    ON n.report_no = p.report_no;
    
