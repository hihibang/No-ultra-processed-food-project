export const NOVA_INFO = {
    title: 'NOVA 식품 분류 체계란?',
    description: `브라질 상파울루 대학에서 개발한 가공 정도에 따른
4단계 국제 공인 식품 분류 기준입니다.`,
    grades: [
        {
            level: '1등급 (자연/최소 가공)',
            color: '#10B981',
            description: '가공되지 않거나 최소 가공된 자연 식품',
            examples: '신선한 과일, 채소, 곡물, 견과류',
        },
        {
            level: '2등급 (가공 식재료)',
            color: '#F59E0B',
            description: '조리에 사용되는 가공 식재료',
            examples: '기름, 소금, 설탕, 벌꿀',
        },
        {
            level: '3등급 (가공식품)',
            color: '#F97316',
            description: '1등급 + 2등급 결합 가공식품',
            examples: '통조림, 단순 치즈, 잼',
        },
        {
            level: '4등급 (초가공식품 - UPF)',
            color: '#EF4444',
            description: '공업적 공정을 거친 초가공식품',
            examples: '스낵, 과자, 음료수, 즉석식품',
        },
    ],
};

export const NOVA_GRADES = [
    { id: 1, label: 'NOVA 1 (자연/최소 가공)', color: '#10B981' },
    { id: 2, label: 'NOVA 2 (가공 식재료)', color: '#F59E0B' },
    { id: 3, label: 'NOVA 3 (가공식품)', color: '#F97316' },
    { id: 4, label: 'NOVA 4 (초가공식품)', color: '#EF4444' },
];

export const NUTRITION_FILTERS = [
    { id: 'lowSugar', label: '저당' },
    { id: 'lowSodium', label: '저염/저나트륨' },
    { id: 'noTransFat', label: '무트랜스지방' },
];

export const EXCLUDED_ADDITIVES = [
    { id: 'noArtificialSweetener', label: '합성감미료 제외' },
    { id: 'noArtificialFlavor', label: '합성향료 제외' },
    { id: 'noPreservative', label: '보존료 제외' },
];