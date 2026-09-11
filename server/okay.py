import requests
import json
import pandas as pd

# 공공데이터포털 일반 인증키
DATA_GO_KR_KEY = "R0appw4%2BL%2B3ZTfxpTkjFzH9w75Zqwjm3cX71vExWeeJLB5YeZJlRBVFeVmHhwHPZMSr6Z0AgqDLnot2GDS4lUQ%3D%3D"

def check_item(report_no="1955050900193"):
    base_url = "https://api.data.go.kr/openapi/tn_pubr_public_nutri_process_info_api"
    url = f"{base_url}?serviceKey={DATA_GO_KR_KEY}&pageNo=1&numOfRows=10&type=json&itemMnftrRptNo={report_no}"
    
    try:
        res = requests.get(url, timeout=10)
        data = res.json()
        
        body = data.get("body")
        if body is None:
            print(f"[조회 결과] 번호 {report_no}는 1번 영양성분 DB에 존재하지 않습니다 (NULL).")
            return
            
        items = body.get("items", {}).get("item", [])
        if isinstance(items, dict):
            items = [items]
            
        if items:
            df = pd.DataFrame(items)
            cols = ['itemMnftrRptNo', 'foodNm', 'mfrNm', 'enerc', 'sugar', 'prot', 'chocdf', 'fatce', 'nat']
            display_cols = [c for c in cols if c in df.columns]
            print(f"=== [품목보고번호 {report_no} 조회 성공] ===")
            print(df[display_cols])
        else:
            print(f"[조회 결과] 번호 {report_no}는 1번 영양성분 DB에 데이터가 없습니다.")
            
    except Exception as e:
        print(f"호출 에러: {e}")

if __name__ == "__main__":
    check_item("1955050900193")