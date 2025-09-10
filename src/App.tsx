import { useMemo, useState, useEffect } from "react";


// 금손떡가 QR 메뉴 랜딩페이지 v1.2 (SyntaxError: Missing semicolon 대응)
// - 전체 파일 문법 정리; 세미콜론/괄호/JSX 구조 점검
// - 기존 테스트 유지 + 가격 표시 추가 케이스 테스트 보강
// - 기능: 이미지 썸네일, 카테고리/검색, 알레르기 배지, UTM, 개별가/최소주문단위 표기, 하단 여백

// === 설정값(매장 정보) ===
const SHOP = {
  brand: "금손떡가",
  phone: "010-4892-0118", // 실제 번호로 교체
  kakaoChannelUrl: "https://pf.kakao.com/_placeholder", // 실제 채널 URL로 교체
  naverMapUrl: "https://map.naver.com/v5/search/금손떡가", // 실제 매장 지도 링크로 교체
  address: "경기도 화성시 동탄반송3길 36-12, 1층", // 정확 주소 기입 권장
  imageBase: "https://your-cdn.example.com/ttok", // 이미지 기본 경로(없으면 절대 URL 사용)
  logoUrl: "https://goldhand001.cafe24.com/%EA%B8%88%EC%86%90%EB%96%A1%EA%B0%80%EB%A1%9C%EA%B3%A0.png", // ✅ 로고 이미지 URL(절대 URL 또는 imageBase 기준 상대경로). 없으면 제목 텍스트로 대체
} as const;

// === 분류 정의 ===
const CATEGORIES = ["전체", "설기", "찰떡", "상차림", "답례"] as const;
type Category = typeof CATEGORIES[number];

// === 메뉴 타입 ===
interface MenuItem {
  id: string;
  category: string; // 카테고리 자유 입력(필터는 CATEGORIES 기반)
  name: string;
  price: number | null; // 레거시 단일가 (새 구조 사용 시 null 권장)
  desc: string;
  allergens?: string[];
  tags?: string[];
  bestseller?: boolean;
  newItem?: boolean;
  image?: string | null;
  // 새 가격 구조(선택)
  unitPrice?: number | null; // 개별가격 (예: 1000)
  moqPack?: string | null;   // 최소주문단위 라벨 (예: "1판(36개)")
  moqPrice?: number | null;  // 최소주문단위 가격 (예: 28000)
}

// === 메뉴 데이터 ===
const MENU: MenuItem[] = [
  {
    id: "bk-seolgi",
    category: "설기",
    name: "백설기",
    price: null,
    desc: "기본의 품격, 금손의 손맛",
    allergens: [],
    tags: ["담백", "정성",],
    bestseller: false,
    image: "https://금손방앗간.com/web/product/medium/202502/575335aac9088c673075a1a08a803422.jpg",
    unitPrice: 1000,
    moqPack: "1판(36개)",
    moqPrice: 28000
  },
  {
    id: "ggul-seolgi",
    category: "설기",
    name: "꿀설기",
    price: null,
    desc: "달지 않게 스며든 꿀의 촉촉함",
    allergens: [],
    bestseller: true,
    tags: ["간식", "촉촉"],
    image: "https://금손방앗간.com/web/product/medium/202501/9c19af55ddb53746c70be71f77c50fc2.jpg",
    unitPrice: 1100,
    moqPack: "1판(36개)",
    moqPrice: 30000
  },
  {
    id: "strawberry-seolgi",
    category: "설기",
    name: "딸기설기",
    price: null,
    desc: "딸기의 산뜻함을 담은 설기",
    allergens: [],
    tags: ["계절", "상큼"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202501/5f42df0efd75dfff0948c76b146b59eb.jpg",
    unitPrice: 1300,
    moqPack: "1판(30개)",
    moqPrice: 39000
  },
  {
    id: "blueberry-seolgi",
    category: "설기",
    name: "블루베리설기",
    price: null,
    desc: "산뜻한 블루베리의 깔끔한 단맛",
    allergens: [],
    tags: ["상큼", "촉촉"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202501/5e393ae40f7fb79ca3c21268c8f95731.jpg",
    unitPrice: 1300,
    moqPack: "1판(30개)",
    moqPrice: 39000
  },
  {
    id: "danhobak-seolgi",
    category: "설기",
    name: "단호박호두꿀설기",
    price: null,
    desc: "단호박의 달콤함에 호두와 꿀의 고소한 풍미",
    allergens: [],
    tags: ["달콤", "고소"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202501/6b29199ac354dc8e50dfeb2e87761049.jpg",
    unitPrice: 1500,
    moqPack: "1판(30개)",
    moqPrice: 45000
  },
  {
    id: "choco-seolgi",
    category: "설기",
    name: "초코설기",
    price: null,
    desc: "부드러운 설기에 초콜릿의 달콤함",
    allergens: [],
    tags: ["달콤", "간식"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/b8e7f74a1c10329cad3375267297331f.jpg",
    unitPrice: 1500,
    moqPack: "1판(30개)",
    moqPrice: 45000
  },
  {
    id: "jat-seolgi",
    category: "설기",
    name: "잣설기",
    price: null,
    desc: "잣의 고소함이 살아있는 담백한 설기",
    allergens: [],
    tags: ["고소", "프리미엄"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/72b8816703eed365b25075128a2674db.jpg",
    unitPrice: 1500,
    moqPack: "1판(30개)",
    moqPrice: 45000
  },
  {
    id: "wandu-ttok",
    category: "찰떡",
    name: "완두배기 찹쌀시루떡",
    price: null,
    desc: "달달한 완두앙금과 찹쌀의 쫀득함",
    allergens: [],
    tags: ["달달", "쫀득"],
    bestseller: true,
    image: "https://금손방앗간.com/web/product/medium/202502/ea605e483e49d62f2999c12a4182af3d.jpg",
    unitPrice: 1500,
    moqPack: "1판(30개)",
    moqPrice: 45000
  },
  {
    id: "nutrition-ttok",
    category: "찰떡",
    name: "영양떡",
    price: null,
    desc: "견과류 폭탄의 건강한 맛",
    allergens: ["견과"],
    tags: ["든든", "건강"],
    bestseller: true,
    image: "https://금손방앗간.com/web/product/medium/202502/01e7107c365d9aa8655c3003451e1d26.jpg",
    unitPrice: 1500,
    moqPack: "1판(30개)",
    moqPrice: 45000
  },
  {
    id: "mosi",
    category: "찰떡",
    name: "모시송편",
    price: null,
    desc: "모싯잎의 은은한 향과 쫀득한 한 입",
    allergens: [],
    tags: ["모시", "쫀득"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/fa5c29aa40b5ae7d291e8c8643b9757d.jpg",
    unitPrice: 1500,
    moqPack: "20개(40알)",
    moqPrice: 30000
  },
  {
    id: "heukimja",
    category: "찰떡",
    name: "흑임자말이떡",
    price: null,
    desc: "고소한 흑임자를 듬뿍 말아낸 풍미",
    allergens: [],
    tags: ["흑임자", "고소"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/8a83409f787b0a5323d7d021b97c200d.jpg",
    unitPrice: 1500,
    moqPack: "1줄(30개)",
    moqPrice: 45000
  },
  {
    id: "yaksik",
    category: "찰떡",
    name: "약식",
    price: null,
    desc: "찹쌀에 대추 향과 은은한 단맛이 어우러진 기본기",
    allergens: [],
    tags: ["전통", "고소"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/ec11c19a74f7e9112467dd27adeea7af.jpg",
    unitPrice: 1500,
    moqPack: "1판(30개)",
    moqPrice: 40000
  },
  {
    id: "3jong",
    category: "상차림",
    name: "상차림3종세트",
    price: null,
    desc: "9구설기+수수팥떡+꽃송편",
    allergens: ["잣(꽃송편)"],
    tags: ["상차림", "잔치"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/a491a1632dfa005a9e6fab27d2772212.jpg",
    unitPrice: null,
    moqPack: "1세트",
    moqPrice: 86000
  },
  {
    id: "9gu",
    category: "상차림",
    name: "9구설기",
    price: null,
    desc: "정갈한 9칸 구성의 두툼한 설기",
    allergens: [],
    tags: ["상차림", "두툼"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/4eef394c3c44d304f3700f6ccd72ac97.jpg",
    unitPrice: null,
    moqPack: "1세트",
    moqPrice: 20000
  },
  {
    id: "flower",
    category: "상차림",
    name: "꽃송편",
    price: null,
    desc: "아름답고 쫀득한 한 입",
    allergens: ["잣"],
    tags: ["화사", "쫀득"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/06dce54c399fcc231c69401330411d46.jpg",
    unitPrice: null,
    moqPack: "1세트",
    moqPrice: 36000
  },
  {
    id: "susu",
    category: "상차림",
    name: "수수경단",
    price: null,
    desc: "수수의 고소함이 살아있는 달콤한 경단",
    allergens: [],
    tags: ["전통", "고소"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202501/ed35ea397dc3d437b0adf87c2e4f5c56.jpg",
    unitPrice: null,
    moqPack: "1세트",
    moqPrice: 26000
  },
  {
    id: "samsek",
    category: "상차림",
    name: "삼색경단",
    price: null,
    desc: "세 가지 색으로 즐기는 한입 경단",
    allergens: [],
    tags: ["한입", "알록달록"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202501/d95ddec6e272eed2486a95754757d944.jpg",
    unitPrice: null,
    moqPack: "1세트",
    moqPrice: 26000
  },
  {
    id: "ggul",
    category: "상차림",
    name: "복주머니 꿀떡",
    price: null,
    desc: "달콤한 꿀을 담은 복주머니 모양 떡",
    allergens: [],
    tags: ["달콤", "행운"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202502/3800537d25e7e1a98cdd10dd8267558c.jpg",
    unitPrice: null,
    moqPack: "1세트",
    moqPrice: 26000
  },
  {
    id: "set-2gu",
    category: "답례",
    name: "2구 답례세트",
    price: null,
    desc: "2구 구성 + 라벨 + 꽃포장",
    allergens: [],
    tags: ["답례", "선물"],
    bestseller: true,
    image: "https://goldhand001.cafe24.com/KakaoTalk_20250910_131828862.jpg"
    unitPrice: 4000,
    moqPack: "30세트",
    moqPrice: 120000
  },
  {
    id: "set-3gu",
    category: "답례",
    name: "3구 답례세트",
    price: null,
    desc: "3구 구성 + 라벨 + 꽃포장",
    allergens: [],
    tags: ["답례", "선물"],
    bestseller: true,
    image: "https://goldhand001.cafe24.com/KakaoTalk_20250910_131829106.jpg"
    unitPrice: 5500,
    moqPack: "30세트",
    moqPrice: 165000
  },
  {
    id: "palgakso",
    category: "답례",
    name: "팔각 답례(소)",
    price: null,
    desc: "팔각 트레이에 담은 답례 세트",
    allergens: [],
    tags: ["답례", "선물"],
    newItem: false,
    image: "https://금손방앗간.com/web/product/medium/202501/c42b8f0632d5a9dd46ba8fdb24c41e95.jpg",
    unitPrice: 16000,
    moqPack: "5세트",
    moqPrice: 80000
  },
];

// === 유틸 ===
function formatPrice(price: number | null): string {
  if (price === null || Number.isNaN(Number(price))) return "미정";
  return `${Number(price).toLocaleString("ko-KR")}원`;
}

function formatKRW(price: number | null | undefined): string {
  if (price === null || price === undefined || Number.isNaN(Number(price))) return "미정";
  return `${Number(price).toLocaleString("ko-KR")}원`;
}

function classNames(...cn: Array<string | false | undefined>): string {
  return cn.filter(Boolean).join(" ");
}

function useQuery(): URLSearchParams {
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());
  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);
  return params;
}

function withUTM(url: string, sourceFallback = "qr_menu"): string {
  try {
    const u = new URL(url);
    const params = new URLSearchParams(window.location.search);
    const src = params.get("src") || sourceFallback;
    u.searchParams.set("utm_source", "qr");
    u.searchParams.set("utm_medium", "offline");
    u.searchParams.set("utm_campaign", "menu_card");
    u.searchParams.set("utm_content", src);
    return u.toString();
  } catch (e) {
    return url;
  }
}

function resolveImage(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (SHOP.imageBase) {
    const base = SHOP.imageBase.replace(/\/$/, "");
    const p = path.replace(/^\//, "");
    return `${base}/${p}`;
  }
  return path;
}

// === 간단 런타임 테스트(개발용) ===
function runDevTests(): void {
  const tests: Array<{ name: string; run: () => void }> = [];
  const assert = (cond: boolean, msg: string): void => {
    if (!cond) throw new Error(msg);
  };

  tests.push({
    name: "formatPrice: null → 미정",
    run: () => assert(formatPrice(null) === "미정", "null 가격은 '미정'이어야 함")
  });

  tests.push({
    name: "formatPrice: 1500 → '1,500원'",
    run: () => assert(formatPrice(1500) === "1,500원", "1500 → 1,500원")
  });

  tests.push({
    name: "formatKRW: 1000 → '1,000원'",
    run: () => assert(formatKRW(1000) === "1,000원", "1000 → 1,000원")
  });

  tests.push({
    name: "resolveImage: 절대 URL 통과",
    run: () => assert(
      resolveImage("https://cdn.ex/ab.webp") === "https://cdn.ex/ab.webp",
      "절대 URL은 그대로 반환"
    )
  });

  tests.push({
    name: "resolveImage: 상대경로 + imageBase 결합",
    run: () => assert(
      resolveImage("a.jpg") === `${SHOP.imageBase.replace(/\/$/, "")}/a.jpg`,
      "상대 경로는 imageBase와 결합"
    )
  });

  tests.push({
    name: "MENU: 카테고리/ID/이름 유효성",
    run: () => {
      MENU.forEach((m) => {
        const catOk = m.category === "설기" || m.category === "찰떡" || m.category === "세트" || m.category === "기타";
        assert(catOk, `잘못된 카테고리: ${m.id} → ${m.category}`);
        assert(!!m.id && !!m.name, `id/name 누락: ${m.id}`);
      });
    }
  });

  // 가격 표기 테스트 확장
  tests.push({
    name: "Pricing: bk-seolgi 개별가/최소주문단위",
    run: () => {
      const s = MENU.find((m) => m.id === "bk-seolgi");
      if (s) {
        assert(s.unitPrice === 1000, "bk-seolgi.unitPrice = 1000");
        assert(s.moqPack === "1판(36개)", "bk-seolgi.moqPack = '1판(36개)'");
        assert(s.moqPrice === 28000, "bk-seolgi.moqPrice = 28000");
      }
    }
  });

  tests.push({
    name: "Pricing: ggul-seolgi 개별가만 존재",
    run: () => {
      const s = MENU.find((m) => m.id === "ggul-seolgi");
      if (s) {
        assert(s.unitPrice === 1200, "ggul-seolgi.unitPrice = 1200");
        assert(!s.moqPack && !s.moqPrice, "ggul-seolgi MOQ 비어있어야 함");
      }
    }
  });

  tests.push({
    name: "Pricing: strawberry-seolgi MOQ만 존재",
    run: () => {
      const s = MENU.find((m) => m.id === "strawberry-seolgi");
      if (s) {
        assert(s.unitPrice == null, "strawberry-seolgi.unitPrice 없음");
        assert(s.moqPack === "1판(20개)", "strawberry-seolgi.moqPack = '1판(20개)'");
        assert(s.moqPrice === 20000, "strawberry-seolgi.moqPrice = 20000");
      }
    }
  });

  // 헤더 로고 설정 유효성
  tests.push({
    name: "Header: logoUrl은 string 또는 null",
    run: () => {
      const ok = SHOP.logoUrl === null || typeof SHOP.logoUrl === "string";
      assert(ok, "SHOP.logoUrl은 string 또는 null이어야 함");
    }
  });

  try {
    for (const t of tests) t.run();
    // eslint-disable-next-line no-console
    console.log("[QR Menu] 테스트 통과:", tests.map((t) => t.name));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[QR Menu] 테스트 실패:", e);
  }
}

export default function GumsunTteokgaMenu() {
  const [category, setCategory] = useState<Category>("전체");
  const [q, setQ] = useState<string>("");
  useQuery(); // 현재는 UTM 부착 외 직접 사용 없음(확장 대비)

  useEffect(() => {
    try {
      runDevTests();
    } catch (e) {
      // noop
    }
  }, []);

  const filtered = useMemo(() => {
    const base = category === "전체" ? MENU : MENU.filter((m) => m.category === category);
    if (!q.trim()) return base;
    const kw = q.toLowerCase();
    return base.filter((m) => [m.name, m.desc, ...(m.tags || [])].join(" ").toLowerCase().includes(kw));
  }, [category, q]);

  /* const kakaoUrl = withUTM(SHOP.kakaoChannelUrl); */
  const mapUrl = withUTM(SHOP.naverMapUrl);
  // SMS 링크 (iOS는 &body, Android는 ?body)
const _ua = (typeof navigator !== "undefined" ? navigator.userAgent : "").toLowerCase();
const _isIOS = /iphone|ipad|ipod/.test(_ua);

// 기본 메시지 (원하는 문구로 수정 가능)
const _smsBody =
  SHOP.brand + " 주문/문의드립니다.\n" +
  "주문자명:\n메뉴:\n수량:\n희망수령일:\n요청사항:";

// 숫자/플러스만 남겨서 정리
const _smsNumber = SHOP.phone.replace(/[^\d+]/g, "");
const smsUrl =
  "sms:" + _smsNumber +
  (_isIOS ? "&body=" : "?body=") +
  encodeURIComponent(_smsBody);

  return (
    <div className="min-h-screen bg-[#2f3457] text-white pb-[calc(32px+env(safe-area-inset-bottom))]">
      {/* 헤더 */}
      <header className="bg-[#2f3457] border-b border-[#c9b08b]/20 overflow-hidden">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center h-full overflow-hidden">
            {resolveImage(SHOP.logoUrl) ? (
              <img
                src={resolveImage(SHOP.logoUrl) as string}
                alt={`${SHOP.brand} 로고`}
                className="h-full max-h-14 w-auto object-contain"
              />
            ) : (
              <h1 className="text-xl font-bold">{SHOP.brand} 메뉴</h1>
            )}
          </div>
          <div className="text-right">
            <a
              href={`tel:${SHOP.phone.replace(/[^\d+]/g, "")}`}
              className="text-sm underline text-white/90 hover:text-white"
            >
              전화
            </a>
          </div>
        </div>
      </header>

      {/* 검색 */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="메뉴 검색 (예: 백설기, 답례)"
          className="w-full rounded-2xl border border-white/30 bg-white/95 text-[#2f3457] placeholder-gray-500 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#c9b08b]"
        />
      </div>

      {/* 카테고리 필터 */}
      <div className="max-w-md mx-auto px-4 mt-3 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={classNames(
              "px-3 py-1.5 rounded-full border text-sm whitespace-nowrap",
              category === c ? "bg-[#c9b08b] text-[#2f3457] border-[#c9b08b]" : "bg-white/10 text-white border-white/20"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 보관/해동 안내 */}
      {/* <div className="max-w-md mx-auto px-4 mt-2">
        <details className="rounded-2xl border border-white/20 bg-white/5 p-4">
          <summary className="cursor-pointer font-semibold text-[#c9b08b]">보관·해동 안내</summary>
          <div className="mt-2 text-sm leading-6 text-gray-700">
            <p>
              보관: 수령 즉시 <strong>냉동 보관(-18℃ 이하)</strong> 권장. 냉장은 식감 저하로 권장하지 않습니다.
            </p>
            <ul className="list-disc ml-5 mt-2">
              <li>설기: 전자레인지 <strong>10–20초(600W)</strong> 또는 실온 <strong>10–15분</strong></li>
              <li>찰떡: 실온 <strong>15–25분</strong> 자연해동 권장</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">※ 위 시간은 예시입니다. 매장 표준 수치로 교체하세요. (근거가 부족합니다)</p>
          </div>
        </details>
      </div> */}

      {/* 메뉴 리스트 */}
      <div className="max-w-md mx-auto px-4 mt-4 grid gap-3">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-2xl border p-4 shadow-sm bg-white text-[#1f2437]">
            {/* 이미지 영역 */}
            <div className="mb-3 overflow-hidden rounded-xl aspect-[4/3] bg-gray-50">
              {resolveImage(m.image) ? (
                <img
                  src={resolveImage(m.image) as string}
                  alt={`${m.name} 이미지`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">이미지 준비 중</div>
              )}
            </div>

            {/* 텍스트 영역 */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">{m.name}</h3>
                  {m.bestseller && (
                    <span className="text-xxs px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-300">BEST</span>
                  )}
                  {m.newItem && (
                    <span className="text-xxs px-2 py-0.5 rounded-full bg-green-100 border border-green-300">신메뉴</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{m.desc}</p>
                {m.tags && (
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {m.tags.map((t) => (
                      <span key={t} className="text-xxs px-2 py-0.5 rounded-full bg-gray-100 border">#{t}</span>
                    ))}
                  </div>
                )}
                {m.allergens && m.allergens.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {m.allergens.map((a) => (
                      <span key={a} className="text-xxs px-2 py-0.5 rounded-full bg-[#f7f1e7] border border-[#c9b08b] text-[#2f3457]">알레르기: {a}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                {m.unitPrice != null || (m.moqPrice != null && m.moqPack) ? (
                  <div className="text-[13px] leading-5">
                    {m.unitPrice != null && (
                      <div>
                        <span className="text-gray-500">개별가격</span>
                        <span className="mx-1">:</span>
                        <span className="font-bold">{formatKRW(m.unitPrice)}</span>
                      </div>
                    )}
                    {m.moqPrice != null && m.moqPack && (
                      <div className="mt-0.5">
                        <span className="text-gray-500">최소주문</span>
                        <span className="mx-1">:</span>
                        <span className="font-bold">{m.moqPack}</span>
                        <span className="mx-1">·</span>
                        <span className="font-bold">{formatKRW(m.moqPrice)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="text-base font-bold">{formatPrice(m.price)}</div>
                    <div className="text-xxs text-gray-500 mt-1">(1EA/기본가 기준)</div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-8">검색 결과가 없습니다.</p>
        )}
      </div>

      {/* CTA 영역 */}
      <div className="max-w-md mx-auto px-4 mt-6 mb-16 grid gap-2">
        {/* <a
          href={kakaoUrl}
          className="block text-center rounded-2xl border border-[#c9b08b] bg-[#c9b08b] text-[#2f3457] py-3 font-semibold"
          target="_blank"
          rel="noreferrer"
        >
          카카오로 주문/문의
        </a> */}
        <a
  href={smsUrl}
  className="block text-center rounded-2xl border border-[#c9b08b] bg-[#c9b08b] text-[#2f3457] py-3 font-semibold"
>
  문자 주문/문의
</a>
        <a
          href={`tel:${SHOP.phone.replace(/[^\d+]/g, "")}`}
          className="block text-center rounded-2xl border border-white text-white/90 py-3 font-semibold bg-transparent"
        >
          전화 연결
        </a>
        <a
          href={mapUrl}
          className="block text-center rounded-2xl border border-white text-white/90 py-3 font-semibold bg-transparent"
          target="_blank"
          rel="noreferrer"
        >
          네이버 지도 열기
        </a>
      </div>
    </div>
  );
}
