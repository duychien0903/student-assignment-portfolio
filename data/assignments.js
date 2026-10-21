/**
 * ============================================================================
 * 個人作業成果資料庫 (STUDENT ASSIGNMENTS DATA SOURCE)
 * 學生：裴維戰 (學號: 1111310133)
 * 系所：資訊科技應用系
 * 
 * 【教學說明】：
 * 每次完成新作業時，只需複製一個作業物件貼到 ASSIGNMENTS_DATA 最上方即可！
 * 網頁會自動計算作業總數、最新更新時間、課程分類與建立搜尋索引。
 * ============================================================================
 */

// 1. 學生基本資料設定 (可直接於此處修改個人資訊)
const STUDENT_PROFILE = {
  name: "裴維戰",
  studentId: "1111310133",
  department: "資訊科技應用系",
  university: "醒吾科技大學 (HWU)",
  interests: ["程式設計", "資訊科技", "遊戲開發", "全端網頁開發"],
  bio: "專注於現代前端開發、關聯式資料庫設計與軟體工程實務。習慣將每日實作過程記錄成文檔，持續累積扎實的資訊科技專業能力。",
  githubUrl: "https://github.com/duychien0903",
  portfolioUrl: "https://hwu1111310133.neocities.org"
};

// 2. 全部作業資料清單 (最新作業請放置在陣列最前端)
const ASSIGNMENTS_DATA = [
  {
    id: "lab-02",
    title: "關聯式資料庫正規化設計與多表 SQL 查詢實作",
    date: "2026-10-18",
    course: "資料庫系統與應用",
    category: "database",
    status: "completed", // "completed" (已完成) | "in-progress" (進行中)
    technologies: ["MySQL", "SQL Workbench", "3NF 正規化", "關聯式模型"],
    description: "針對大專院校學生選課管理情境，規劃符合第三正規化 (3NF) 之關聯式資料庫結構，並撰寫多表連接 (JOIN) 查詢指令以驗證資料完整性。",
    objectives: [
      "理解第一 (1NF)、第二 (2NF) 與第三正規化 (3NF) 的拆分原則，消除資料重複性與更新異常。",
      "繪製實體關聯圖 (ER Diagram)，定義主鍵 (Primary Key) 與外鍵 (Foreign Key) 關聯約束。",
      "撰寫標準 SQL DDL (建立資料表) 與 DML (插入、更新、複合查詢)。",
      "使用 INNER JOIN 與 WHERE 子句實現跨三張表的精準成績與選課資料檢索。"
    ],
    steps: [
      {
        step: 1,
        title: "實體與屬性需求分析",
        content: "拆解學生 (students)、課程 (courses) 與選課明細 (enrollments) 三大核心實體，將多對多 (M:N) 關係轉化為兩個一對多 (1:N) 關聯。"
      },
      {
        step: 2,
        title: "資料表正規化與欄位資料型態定義",
        content: "在 MySQL 中建立資料庫 StudentCourseDB，指定 utf8mb4 編碼，為學號 (student_id) 與課程代碼 (course_id) 建立索引加速查詢。"
      },
      {
        step: 3,
        title: "匯入測試資料並執行跨表 SQL 查詢",
        content: "撰寫複合查詢 SQL 語法，查詢指定學號 (1111310133) 裴維戰同學本學期所有選課名稱、學分數與實作考核成績。"
      }
    ],
    results: [
      "成功建立 3 張關聯資料表，資料庫架構通過 3NF 檢驗，無相依異常。",
      "查詢執行時間小於 0.003 秒，終端成功產出完整結構化學生成績報表。"
    ],
    challenges: [
      {
        problem: "外鍵條件約束 (Foreign Key Constraint) 在刪除主表紀錄時發生報錯。",
        solution: "於關聯定義中補上 ON DELETE CASCADE 或改用邏輯刪除狀態註記，避免孤立資料 (Orphan Records) 產生。"
      }
    ],
    reflection: "資料庫正規化是資訊系統的基石。透過本次實務設計，深刻體會到事前規劃良好的資料結構，能大幅降低後續 SQL 查詢的複雜度與維護成本。",
    screenshots: [
      {
        url: "./images/assignments/db-lab-02-schema.svg",
        caption: "實作截圖一：MySQL Workbench 繪製之學生選課系統 ER Diagram 實體關聯架構圖"
      },
      {
        url: "./images/assignments/db-lab-02-query.svg",
        caption: "實作截圖二：終端機執行多表 JOIN 複合查詢並成功輸出格式化成績結果"
      }
    ]
  },
  {
    id: "lab-01",
    title: "響應式網頁前端佈局與互動式卡片排版實作",
    date: "2026-10-12",
    course: "網頁前端設計與應用",
    category: "frontend",
    status: "completed",
    technologies: ["HTML5", "CSS3", "JavaScript", "Flexbox", "CSS Grid", "RWD"],
    description: "運用現代語意化 HTML5 與 CSS Grid/Flexbox 技術，打造跨裝置（手機、平板、桌面）自適應排版之實作成果展示介面。",
    objectives: [
      "落實 HTML5 語意化標籤（header, main, section, article, footer）以利 SEO 與無障礙瀏覽。",
      "使用 CSS Custom Properties (變數) 建立全域一致的 Design Tokens 色彩與字級系統。",
      "實作 Mobile-First 響應式斷點設計，確保各尺寸螢幕皆無橫向溢出或版面錯位。",
      "撰寫原生 JavaScript 監聽捲動與點擊事件，提供流暢的微動畫互動體驗。"
    ],
    steps: [
      {
        step: 1,
        title: "架構規劃與 HTML5 語意標籤佈局",
        content: "建立 index.html，設定好 viewport 與中文字型引用，規劃符合規範之層級結構。"
      },
      {
        step: 2,
        title: "撰寫 CSS 現代網格系統與卡片微陰影",
        content: "運用 CSS Grid 與 repeat(auto-fit, minmax(...)) 達成無須繁瑣計算的自適應卡片流式排列。"
      },
      {
        step: 3,
        title: "跨瀏覽器測試與行動裝置斷點除錯",
        content: "使用 Chrome DevTools 模擬 iPhone 14、iPad Air 與 1080p 桌面環境，確認文字行距與按鈕點擊範圍皆符合最佳體驗。"
      }
    ],
    results: [
      "完成 100% 自適應響應式頁面，通過 Lighthouse 效能與最佳實踐高分檢驗。",
      "按鈕點擊與卡片 Hover 動態平順自然，達成零 CSS/JS 報錯之要求。"
    ],
    challenges: [
      {
        problem: "在小尺寸螢幕上，多欄位表格容易發生文字截斷或畫面被水平撐開。",
        solution: "引入 overflow-x: auto 與 CSS min() 函式，使卡片在手機端自動轉為垂直單欄排列。"
      }
    ],
    reflection: "前端開發不僅僅是『把圖切出來』，更重要的是使用者在不同設備上的流暢體驗。堅持使用原生純碼而非過重框架，大幅提升了對底層原理的掌握度。",
    screenshots: [
      {
        url: "./images/assignments/web-lab-01-code.svg",
        caption: "實作截圖一：VS Code 專案原始碼結構、CSS 樣式表與 Git 提交終端機介面"
      },
      {
        url: "./images/assignments/web-lab-01-result.svg",
        caption: "實作截圖二：Chrome 瀏覽器實際載入運行之自適應多欄網格卡片渲染畫面"
      }
    ]
  }
];

// 3. 課程科目分類設定 (便於過濾器與統計顯示)
const COURSE_CATEGORIES = [
  { key: "all", label: "全部作業" },
  { key: "frontend", label: "網頁前端設計", courseName: "網頁前端設計與應用" },
  { key: "database", label: "資料庫系統", courseName: "資料庫系統與應用" },
  { key: "programming", label: "程式設計", courseName: "物件導向程式設計" },
  { key: "network", label: "電腦網路", courseName: "電腦網路與通訊" }
];
