새로운 데이터 베이스 불러올때
mysql food_product/food_mutrition 테이블의 값 지운 후
1. 2번 DB: 식품(첨가물)품목제조보고(원재료)의 새로운 csv 다운로드 후 /server 폴더에 적재
2. loadProductFromCsv.js 실행
3. loadNutritionData 실행 
(1번 수집 + 정규화 + active_food_catalog 최종 재생성까지 자동 완료)