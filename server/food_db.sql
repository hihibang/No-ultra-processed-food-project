-- 1. 데이터베이스 생성 및 선택
CREATE DATABASE IF NOT EXISTS food_db 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE food_db;
show full tables;

desc food_nutrition; -- 테이블 & 뷰 컬럼 구조 확인
select * from food_additive_standard where additive_category = "향미증진제";
select * from recipe;

-- ========================================================
-- DB에서 데이터 가져와 만든 테이블에 넣는 과정
-- ========================================================

-- 1. 정규화 제품명 컬럼 추가
ALTER TABLE food_product 
ADD COLUMN normalized_name VARCHAR(255) NULL AFTER product_name;

SET SQL_SAFE_UPDATES = 0;
-- 2. 제품명 정규화 업데이트
UPDATE food_product
SET normalized_name = TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(product_name, '\\s*\\([^)]*\\)|\\s*\\[[^\\]]*\\]', ''), 
    '\\s*[0-9]+(\\.[0-9]+)?\\s*(g|kg|ml|l|L|개입|입|봉|EA|ea)$', ''
  )
)
WHERE normalized_name IS NULL;

-- 3. 안전 모드 복구 (권장)
SET SQL_SAFE_UPDATES = 1;

-- 4. 인덱스 생성
CREATE INDEX idx_food_norm_comp ON food_product(company_name, normalized_name);
CREATE INDEX idx_food_norm_name ON food_product(normalized_name);

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
-- 5. 1-2번 결합 VIEW (2번 food_product 기준 RIGHT JOIN) 삭제
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
    

-- ========================================================
-- 6. 가상 뷰 (v_active_food_catalog) 생성
-- ========================================================

CREATE OR REPLACE VIEW v_active_food_catalog AS
WITH ranked_products AS (
    SELECT 
        p.report_no,
        p.product_name,
        p.normalized_name,
        p.company_name,
        p.product_type,
        p.raw_materials,
        COALESCE(NULLIF(p.change_date, ''), p.report_date) AS latest_date,
        n.calories,
        n.carbohydrate,
        n.protein,
        n.fat,
        n.sugars,
        n.sodium,
        n.saturated_fat,
        n.trans_fat,
        n.cholesterol,
        n.serving_size,
        n.total_weight,
        ROW_NUMBER() OVER (
            PARTITION BY p.company_name, p.normalized_name 
            ORDER BY COALESCE(NULLIF(p.change_date, ''), p.report_date) DESC, p.report_no DESC
        ) AS rn
    FROM food_product p
    INNER JOIN food_nutrition n ON p.report_no = n.report_no
    WHERE p.raw_materials IS NOT NULL
)
SELECT 
    report_no,
    product_name,
    normalized_name,
    company_name,
    product_type,
    raw_materials,
    latest_date,
    calories,
    carbohydrate,
    protein,
    fat,
    sugars,
    sodium,
    saturated_fat,
    trans_fat,
    cholesterol,
    serving_size,
    total_weight
FROM ranked_products 
WHERE rn = 1;

-- ========================================================
-- 7. 유저 검색용 고속 캐시 테이블 (active_food_catalog) 생성
-- ========================================================

DROP TABLE IF EXISTS active_food_catalog;

-- 뷰(v_active_food_catalog)에서 대표 상품 선별 결과를 물리 테이블로 복제
CREATE TABLE active_food_catalog AS
SELECT * FROM v_active_food_catalog;

-- 빠른 조회를 위한 기본키(PK) 및 다중 검색 인덱스 추가
ALTER TABLE active_food_catalog ADD PRIMARY KEY (report_no);
CREATE INDEX idx_catalog_norm_name ON active_food_catalog (normalized_name);
CREATE INDEX idx_catalog_prod_name ON active_food_catalog (product_name);
CREATE INDEX idx_catalog_company   ON active_food_catalog (company_name);
CREATE INDEX idx_catalog_type      ON active_food_catalog (product_type);

-- 1. 중복 제거된 유효 대표 가공식품 총 건수 확인
SELECT COUNT(*) AS total_active_products FROM active_food_catalog;

-- 2. 신라면, 포카칩 등 대표 제품의 중복 제거 및 영양성분 매칭 샘플 확인
SELECT 
    company_name AS 제조사,
    normalized_name AS 대표제품명,
    product_name AS 실제제품명,
    latest_date AS 최신일자,
    calories AS 칼로리_kcal,
    sugars AS 당류_g,
    sodium AS 나트륨_mg,
    raw_materials AS 원재료
FROM active_food_catalog
WHERE normalized_name LIKE '%신라면%' 
   OR normalized_name LIKE '%포카칩%'
ORDER BY company_name, normalized_name
LIMIT 5;

-- ========================================================
-- 8. 용도 분류 컬럼 추가 및 키워드 자동 매핑
-- ========================================================
ALTER TABLE food_additive_standard 
ADD COLUMN additive_category VARCHAR(50) AFTER additive_name;

CREATE INDEX idx_additive_cat ON food_additive_standard (additive_category);

SET SQL_SAFE_UPDATES = 0;

-- 1. 감미료 (단맛 대체/증폭)
UPDATE food_additive_standard
SET additive_category = '감미료'
WHERE additive_name REGEXP '수크랄로스|아스파탐|아세설팜|사카린|에리스리톨|스테비|자일리톨|솔비톨|말티톨|소르비톨';

-- 2. 향미증진제 (감칠맛/조미료)
UPDATE food_additive_standard
SET additive_category = '향미증진제'
WHERE additive_name REGEXP '글루탐산|리보뉴클레오티드|이노신산|구아닐산|호박산|조미료|엑기스';

-- 3. 착색료 (인공/합성 색소)
UPDATE food_additive_standard
SET additive_category = '착색료'
WHERE additive_name REGEXP '색소|타르|카라멜|동클로로필린|안토시아닌';

-- 4. 보존료 / 산화방지제 (유통기한 연장)
UPDATE food_additive_standard
SET additive_category = '보존료/산화방지제'
WHERE additive_name REGEXP '소르빈산|안식향산|프로피온산|디부틸히드록시톨루엔|부틸히드록시아니솔|아황산|아질산|질산';

-- 5. 유화제 / 증점제 / 안정제 (물성·질감 변형)
UPDATE food_additive_standard
SET additive_category = '유화/안정제'
WHERE additive_name REGEXP '레시틴|글리세린|에스테르|카라기난|잔탄검|구아검|아라비아검|셀룰로오스|알긴산|펙틴';

-- 6. 산도조절제 / 팽창제
UPDATE food_additive_standard
SET additive_category = '산도조절제'
WHERE additive_name REGEXP '탄산나트륨|탄산수소|구연산|젖산|초산|인산염|명반|피로인산';

-- 7. 향료 (풍미 부여)
UPDATE food_additive_standard
SET additive_category = '합성향료'
WHERE additive_name REGEXP '향료|바닐린|착향';

-- 8. 나머지는 일반 가공/기타 보조제로 기본값 지정
UPDATE food_additive_standard
SET additive_category = '기타첨가제'
WHERE additive_category IS NULL;

SET SQL_SAFE_UPDATES = 1;