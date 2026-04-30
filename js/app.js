document.addEventListener('DOMContentLoaded', () => {
  // 強制捲動到最上方並清除 URL 錨點
  window.scrollTo(0, 0);
  if (window.location.hash) {
    history.replaceState('', document.title, window.location.pathname + window.location.search);
  }

  // ===== 狀態管理與防錯處理 =====
  let initialNotes = JSON.parse(localStorage.getItem('japanTripNotes'));
  if (!Array.isArray(initialNotes)) initialNotes = [];

  let initialTodos = JSON.parse(localStorage.getItem('japanTripTodos'));
  if (!Array.isArray(initialTodos)) initialTodos = [];

  let initialChecklist = JSON.parse(localStorage.getItem('japanTripChecklist'));
  if (!Array.isArray(initialChecklist)) initialChecklist = [];

  const state = {
    notes: initialNotes,
    todos: initialTodos,
    checklist: initialChecklist
  };

  let weatherByDate = {};

  function saveTodos() {
    localStorage.setItem('japanTripTodos', JSON.stringify(state.todos));
  }

  function saveChecklist() {
    localStorage.setItem('japanTripChecklist', JSON.stringify(state.checklist));
  }

  // ===== 行程資料 =====
  const itineraryData = [
    { date: '5/5', location: '東京/成田', type: 'tokyo', desc: '出發前往東京，成田山新勝寺', detail: '班機：CI 102 (07:55 KHH T1 - 12:35 NRT T2)。抵達後前往成田山新勝寺與表參道。<br>🏨 住宿：成田國際花園飯店 (0476-23-5522)<br><br>🛍️ <b>附近採買：</b><br>• <b>超商</b>：飯店一樓大廳內就有 <b>7-11</b>，走出飯店 1 分鐘有 Mini-Stop，非常方便。<br>• <b>超市/伴手禮</b>：步行範圍內無大型超市，需搭乘飯店免費接駁車至 <b>Aeon Mall 成田</b> (內有 Aeon Style 超市及免稅專櫃)。' },
    { date: '5/6', location: '長野', type: 'nagano', desc: '足利紫藤花卉公園、白馬山麓', detail: 'CNN 嚴選全球十大最夢幻景點《足利紫藤花卉公園》藤花物語 / 紫藤花瀑布 / 紫藤花隧道。途經白馬山麓地區。<br>🏨 住宿：栂池太陽廣場溫泉飯店 (0261-83-2423)<br><br>🛍️ <b>附近採買：</b><br>• <b>超商</b>：飯店出門步行約 50 公尺即有當地便利商店。<br>• <b>伴手禮</b>：步行範圍內為溫泉/滑雪街，可於附近土產店買到信州蘋果點心、七味粉等當地名產。*(註：大型超市 DELiCiA 在白馬市區，走路無法抵達)*' },
    { date: '5/7', location: '黑部立山', type: 'tateyama', desc: '立山黑部阿爾卑斯之路、兼六園', detail: '扇澤【關電巴士】→黑部水壩【徒步】→黑部湖【黑部地下纜車】→黑部平【空中纜車】→大觀峰【隧道巴士】→室堂‧雪之大谷（開山～６月下旬）【高原巴士】→美女平【電纜車或代行巴士】→立山→日本三大名園/「兼六園」。<br>🏨 住宿：金澤站前露櫻溫泉飯店 (050-5576-8105)<br><br>🛍️ <b>附近採買：</b><br>• <b>超市</b>：就在金澤車站旁！車站內有 100ban Mart (2F)，或步行 2 分鐘至 Cross Gate 內的 KAJIMART。<br>• <b>伴手禮</b>：車站內「金澤百番街 Anto」應有盡有 (金鍔、和菓子、海鮮)。<br>• <b>電器</b>：車站旁可至金澤 Forus 逛街，大型家電量販店較少。' },
    { date: '5/8', location: '白川鄉/上高地', type: 'shirakawa', desc: '合掌村、上高地', detail: '白川鄉合掌村（聯合國列入世界遺產、國家指定重要傳統建築物群保存區）。下午前往日本阿爾卑斯仙境/神之故鄉上高地（路經大正池、眺望穗高連峰、河童橋）。<br>🏨 住宿：緣之杜山中湖溫泉飯店 (0555-72-8084)<br><br>🛍️ <b>附近採買：</b><br>• 此區超商較遠，建議在前往飯店前先買好今晚的零食與飲料。' },
    { date: '5/9', location: '富士山', type: 'fuji', desc: '富士西湖夢幻合掌村落、忍野八海', detail: '途徑富士河口湖～遠眺富士山美景。前往日本百水名選之處「忍野八海」、「淺間神社」。<br>🏨 住宿：DaiwaRoynetHotel大宮西口 (048-779-8475)<br><br>🛍️ <b>附近採買：</b><br>• <b>超市</b>：步行 500m 內超好逛！大宮站旁有 Aeon Style、成城石井、大榮超市與 Maruetsu (營業至深夜)。<br>• <b>電器</b>：飯店步行可達 <b>BIC CAMERA</b> (大宮西口 SOGO 店)。<br>• <b>伴手禮</b>：大宮站內商城 ecute 大宮、SOGO 地下街。' },
    { date: '5/10', location: '川越/東京', type: 'tokyo', desc: '小江戶川越、台場鋼彈', detail: '日本小江戶川越 / 菓子屋橫町 / 時之鐘。參觀古色古香的冰川神社。接著前往 DiverCity Tokyo Plaza 觀賞巨大鋼彈戰士模型。<br>🏨 住宿：露櫻Grand東京浅草橋溫泉飯店 (050-5864-0363)<br><br>🛍️ <b>附近採買：</b><br>• <b>超市</b>：步行 100m 內就有肉之Hanamasa (24小時) 以及 My Basket 都會型超市。<br>• <b>電器</b>：淺草橋搭 JR 總武線 1 站 (約2分) 至<b>秋葉原</b>，直達 Yodobashi 等大型家電賣場。<br>• <b>伴手禮</b>：搭都營淺草線 1 站至<b>淺草</b>，逛仲見世商店街。' },
    { date: '5/11', location: '賦歸', type: 'transit', desc: '前往成田機場搭機返台', detail: '班機：CI 103 (13:35 NRT T2 - 16:40 KHH T1)。帶著滿滿的回憶，回到溫暖的家！<br><br>🛍️ <b>最後採買 (成田 T2)：</b><br>• <b>免稅店</b>：成田 T2 必買 <b>NewYork Perfect Cheese</b>、<b>楓糖男孩</b>、<b>Press Butter Sand</b>！' }
  ];

  const dashboardCards = [
    {
      icon: '✈️',
      label: '接送搭車',
      value: '5/5 03:30～40',
      detail: '機場接送，請提早完成上車準備'
    },
    {
      icon: '🧭',
      label: '機場集合',
      value: '5/5 04:55',
      detail: '小港機場 T1 中華航空團體櫃台'
    },
    {
      icon: '🛫',
      label: '去程航班',
      value: 'CI 102',
      detail: 'KHH 07:55 → NRT 12:35'
    },
    {
      icon: '🛬',
      label: '回程航班',
      value: 'CI 103',
      detail: 'NRT 13:35 → KHH 16:40'
    },
    {
      icon: '👨‍💼',
      label: '領隊導遊',
      value: '黃仁佐',
      detail: '台灣 0931-981-023 / 日本 080-4897-3510'
    }
  ];

  const checklistData = {
    '證件與入境': [
      '護照效期確認大於六個月',
      '旅行社小包隨身攜帶',
      '入境卡備妥，紙本或電子資料都先確認',
      'Visit Japan Web 填妥並截圖備份',
      '機票、行程表、旅遊保險放入手機與雲端',
      '領隊與緊急聯絡電話加入通訊錄'
    ],
    '行李與飛安': [
      '5/5 03:30～40 機場接送搭車',
      '托運行李控制在 23 公斤內',
      '手提行李控制在 7 公斤內',
      '行動電源與備用鋰電池放手提，不放托運',
      '液體、噴霧、凝膠類依機場安檢規定整理'
    ],
    '山區裝備': [
      '防風防水外套',
      '保暖中層衣物與帽子',
      '太陽眼鏡或雪地護目鏡',
      '防滑防水鞋',
      '暈車藥與個人常備藥'
    ],
    '採買提醒': [
      '5/8 回山中湖飯店前先買飲水與零食',
      '成田 T2 免稅店保留伴手禮採買時間',
      '日本現金與信用卡分開收納',
      '大型行李預留伴手禮空間'
    ]
  };

  const weatherStops = [
    { date: '5/5', isoDate: '2026-05-05', area: '成田', note: '成田山、成田表參道', lat: 35.7767, lon: 140.3189 },
    { date: '5/6', isoDate: '2026-05-06', area: '足利/白馬', note: '足利紫藤花、白馬山麓', lat: 36.6982, lon: 137.8619 },
    { date: '5/7', isoDate: '2026-05-07', area: '立山黑部', note: '室堂、雪之大谷', lat: 36.5750, lon: 137.5970 },
    { date: '5/8', isoDate: '2026-05-08', area: '上高地/山中湖', note: '上高地、山中湖住宿', lat: 35.4106, lon: 138.8609 },
    { date: '5/9', isoDate: '2026-05-09', area: '富士山/大宮', note: '忍野八海、大宮住宿', lat: 35.4606, lon: 138.8326 },
    { date: '5/10', isoDate: '2026-05-10', area: '川越/東京', note: '小江戶川越、台場、淺草橋', lat: 35.6812, lon: 139.7671 },
    { date: '5/11', isoDate: '2026-05-11', area: '成田機場', note: '成田 T2 返台', lat: 35.7767, lon: 140.3189 }
  ];

  const weatherCodeMap = {
    0: ['☀️', '晴朗'],
    1: ['🌤️', '大致晴朗'],
    2: ['⛅', '局部多雲'],
    3: ['☁️', '多雲'],
    45: ['🌫️', '有霧'],
    48: ['🌫️', '霧淞'],
    51: ['🌦️', '毛毛雨'],
    53: ['🌦️', '毛毛雨'],
    55: ['🌧️', '毛毛雨偏強'],
    61: ['🌧️', '小雨'],
    63: ['🌧️', '降雨'],
    65: ['🌧️', '大雨'],
    71: ['🌨️', '小雪'],
    73: ['🌨️', '降雪'],
    75: ['❄️', '大雪'],
    80: ['🌦️', '短暫陣雨'],
    81: ['🌧️', '陣雨'],
    82: ['⛈️', '強陣雨'],
    95: ['⛈️', '雷雨'],
    96: ['⛈️', '雷雨冰雹'],
    99: ['⛈️', '強雷雨冰雹']
  };


  // ===== 旅遊小撇步資料 (含解析資料) =====
  const tipsData = {
    '行前準備': [
      { icon: '🎫', title: '護照與簽證', content: '確認護照效期大於六個月。填寫 Visit Japan Web 以加速入境通關。' },
      { icon: '🛂', title: '旅行社小包與入境卡', content: '旅行社提供的小包請隨身攜帶，入境卡也先備妥；若已用 Visit Japan Web，仍建議保留截圖或紙本備份。' },
      { icon: '🔌', title: '電壓與網路', content: '日本電壓為 100V，插頭與台灣相同（雙平腳）。建議提早購買 eSIM 或 WiFi 機。' },
      { icon: '🧳', title: '行李規範 (華航)', content: '免費行李服務包含每人 7 公斤手提行李 + 1 件 23 公斤托運行李。超重部分需於現場自理費用。' },
      { icon: '🔋', title: '飛安注意事項', content: '手機、相機等電子產品的「備用鋰電池」及行動電源，僅能放在【手提行李】中，且須符合 100 瓦小時以下規格，切勿放置於托運行李以免受罰。' },
      { icon: '💵', title: '海關金錢限制', content: '現金不超過美金一萬元等值外幣（旅行支票不限），新台幣不超過六萬元整。' }
    ],
    '旅遊須知': [
      { icon: '🧥', title: '氣候與穿著', content: '五月立山黑部山區氣溫較低（0~10度），需準備保暖外套、太陽眼鏡（防雪盲）與防滑鞋。' },
      { icon: '💊', title: '常備藥品', content: '請自行準備個人常備藥物（如感冒藥、腸胃藥、暈車藥等）。' },
      { icon: '🗣️', title: '禮貌用語', content: '基本問候：Sumimasen (不好意思/請問)、Arigatou (謝謝)。' }
    ],
    '緊急聯絡': [
      { icon: '📞', title: '台灣緊急聯絡處', content: '吳小姐 0978-277-997<br>陳小姐 0985-337-241' }
    ],
    '航廈伴手禮重點': [
      { icon: '🇯🇵', title: '成田機場 T2 (出境後)', content: '必買：<b>NewYork Perfect Cheese</b> (起司奶油脆餅)、<b>楓糖男孩</b>、<b>Press Butter Sand</b>。地點：Fa-So-La AKIHABARA 免稅店。' },
      { icon: '🍌', title: '成田機場 T2 限定', content: '東京芭娜娜 (Tokyo Banana) 聯名款或季節限定口味。' },
      { icon: '🇹🇼', title: '高雄小港 T1 (出境後)', content: '昇恆昌免稅店可購買鳳梨酥、台灣茶等名產。注意：肉乾不可攜入日本。' }
    ],
    '山區行程訣竅 (黑部立山/上高地)': [
      { icon: '🧥', title: '洋蔥式穿搭', content: '高山雪地與車廂內(暖氣)溫差極大。內層透氣、中層保暖，外層務必穿「防風防水」外套，方便隨時穿脫。' },
      { icon: '🕶️', title: '太陽眼鏡 (防雪盲)', content: '雪地反光極強，不戴太陽眼鏡極容易發生「雪盲症」導致眼睛刺痛流淚，請務必隨身攜帶。' },
      { icon: '🥾', title: '防滑防水鞋', content: '雪之大谷可能有融雪或結冰，非常濕滑。請穿著底部刻痕深、抓地力強且具基礎防水功能的鞋子。' },
      { icon: '💊', title: '暈車藥', content: '前往黑部立山與上高地需轉乘多種交通工具及山路巴士，容易暈車者請務必提前服用暈車藥。' },
      { icon: '📸', title: '拍照小建議', content: '雪地一片死白，建議穿著紅色、黃色等「鮮豔色系」的外套或配件，拍照效果會非常亮眼。' }
    ]
  };

  // ===== 美食與景點推薦 (來自解析資料) =====
  const recommendationsData = {
    '特色體驗': [
      { icon: '❄️', title: '雪之大谷', content: '每年春季限定的雪壁絕景，最高可達近 20 公尺，是立山黑部必看重點！' },
      { icon: '🌸', title: '足利紫藤花', content: 'CNN 嚴選全球十大最夢幻景點，大藤棚如同紫色瀑布般壯觀。' },
      { icon: '🏘️', title: '白川鄉合掌村', content: '世界遺產聚落，木造合掌屋與山景很適合慢慢拍照。' },
      { icon: '🗻', title: '忍野八海', content: '富士山伏流水形成的八座湧泉池，天氣好時可拍到富士山。' }
    ],
    '採買熱點': [
      { icon: '🛍️', title: '金澤百番街 Anto', content: '金澤站內即可買和菓子、金箔點心與海鮮伴手禮，動線最省力。' },
      { icon: '📷', title: '秋葉原電器街', content: '5/10 住淺草橋，搭 JR 總武線一站就到秋葉原，適合補買電器與相機用品。' },
      { icon: '🍪', title: '成田 T2 免稅', content: 'NewYork Perfect Cheese、楓糖男孩、Press Butter Sand 建議先排優先順序。' }
    ],
    '晚間補給': [
      { icon: '🏪', title: '大宮西口', content: 'Aeon Style、成城石井、Maruetsu 與 BIC CAMERA 都在步行可達範圍。' },
      { icon: '🥩', title: '淺草橋', content: '飯店附近有 24 小時肉之 Hanamasa 與 My Basket，最後兩晚補給方便。' }
    ]
  };

  // ===== 資料整合紀錄 =====
  const dataRegistry = [
    {
      type: 'pdf',
      file: '0505(華航)高出黑部立山七天LIST.pdf',
      url: 'data/0505(華航)高出黑部立山七天LIST.pdf',
      icon: '📄',
      added: '2026/04/30',
      integrated: '2026/04/30',
      summary: '華航客製高出黑部立山 7 日，含航班、住宿、領隊與每日行程明細。'
    }
  ];

  // ===== Undo Toast 共用函式 =====
  // 傳入: label(描述文字), onCommit(時間到後正式刪除), onUndo(按復原後還原)
  function showUndoToast(label, onCommit, onUndo) {
    const DELAY = 60 * 1000; // 60 秒
    const container = document.getElementById('undoToastContainer');

    // 建立 toast 元素
    const toast = document.createElement('div');
    toast.className = 'undo-toast';
    toast.innerHTML = `
      <div class="undo-toast-msg">
        <span class="undo-toast-label">已刪除</span>
        <span class="undo-toast-title">${label}</span>
      </div>
      <span class="undo-countdown">60</span>
      <button type="button" class="undo-btn">↩ 復原</button>
      <div class="undo-toast-progress"></div>
    `;
    container.appendChild(toast);

    // 倒數顯示
    let remaining = 60;
    const countdownEl = toast.querySelector('.undo-countdown');
    const ticker = setInterval(() => {
      remaining--;
      countdownEl.textContent = remaining;
      if (remaining <= 0) clearInterval(ticker);
    }, 1000);

    // 時間到 → 正式刪除
    const commitTimer = setTimeout(() => {
      clearInterval(ticker);
      dismissToast(toast);
      onCommit();
    }, DELAY);

    // 復原按鈕
    toast.querySelector('.undo-btn').addEventListener('click', () => {
      clearTimeout(commitTimer);
      clearInterval(ticker);
      dismissToast(toast);
      onUndo();
    });

    function dismissToast(el) {
      el.classList.add('toast-hiding');
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
    }
  }

  // ===== 訂位資料 =====
  const bookings = [
    {
      category: 'transit',
      icon: '🚐',
      status: 'confirmed',
      title: '機場接送',
      subtitle: '前往高雄小港機場 T1',
      date: '2026/05/05',
      time: '03:30～03:40',
      note: '搭乘日期：5/5。請於 03:30～03:40 完成上車準備，預留清晨接送與機場報到時間。'
    },
    {
      category: 'transit',
      icon: '✈️',
      status: 'confirmed',
      title: '中華航空 去程 (CI 102)',
      subtitle: '高雄小港 T1 → 東京成田 T2',
      date: '2026/05/05',
      time: '07:55 - 12:35',
      note: '團體編號: TYO6CI0505A7。請於 04:55 至小港機場 T1 中華航空團體櫃台集合。'
    },
    {
      category: 'transit',
      icon: '✈️',
      status: 'confirmed',
      title: '中華航空 回程 (CI 103)',
      subtitle: '東京成田 T2 → 高雄小港 T1',
      date: '2026/05/11',
      time: '13:35 - 16:40',
      note: '搭機返台。建議提早 3 小時抵達成田 T2 進行最後採買。'
    },
    {
      category: 'hotel',
      icon: '🏨',
      status: 'confirmed',
      title: '成田國際花園飯店',
      subtitle: '5/5 東京/成田',
      date: '2026/05/05',
      note: '電話: 0476-23-5522。飯店一樓大廳有 7-11，另可搭接駁車至 Aeon Mall 成田。'
    },
    {
      category: 'hotel',
      icon: '♨️',
      status: 'confirmed',
      title: '栂池太陽廣場溫泉飯店',
      subtitle: '5/6 白馬山麓',
      date: '2026/05/06',
      note: '電話: 0261-83-2423。附近以溫泉街、土產店為主，大型超市不在步行範圍。'
    },
    {
      category: 'hotel',
      icon: '♨️',
      status: 'confirmed',
      title: '金澤站前露櫻溫泉飯店',
      subtitle: '5/7 金澤站前',
      date: '2026/05/07',
      note: '電話: 050-5576-8105。金澤站旁採買方便，可逛 100ban Mart、KAJIMART、金澤百番街 Anto。'
    },
    {
      category: 'hotel',
      icon: '♨️',
      status: 'confirmed',
      title: '緣之杜山中湖溫泉飯店',
      subtitle: '5/8 山中湖',
      date: '2026/05/08',
      note: '電話: 0555-72-8084。附近沒有便利商店，務必在上山前先買好補給。'
    },
    {
      category: 'hotel',
      icon: '🏨',
      status: 'confirmed',
      title: 'Daiwa Roynet Hotel 大宮西口',
      subtitle: '5/9 大宮',
      date: '2026/05/09',
      note: '電話: 048-779-8475。步行可到 Aeon Style、BIC CAMERA、ecute 大宮與 SOGO 地下街。'
    },
    {
      category: 'hotel',
      icon: '♨️',
      status: 'confirmed',
      title: '露櫻 Grand 東京淺草橋溫泉飯店',
      subtitle: '5/10 淺草橋',
      date: '2026/05/10',
      note: '電話: 050-5864-0363。近秋葉原與淺草，適合最後採買。'
    }
  ];

  // ===== 初始化功能 =====
  initNavbar();
  initCountdown();

  initWeatherForecast();
  renderCalendar();
  renderChecklist();
  renderMasterTodoList();
  renderRecommendations();
  renderTips();
  renderBookings();
  renderRegistry();
  initNotes();
  initBackupTools();
  initBackToTop();

  // ===== 導覽列功能 =====
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Scroll Spy
      let current = '';
      const sections = document.querySelectorAll('.section');
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
          current = section.getAttribute('id');
        }
      });

      links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
          link.classList.add('active');
        }
      });
    });

    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // ===== 倒數計時 =====
  function initCountdown() {
    const countdownEl = document.getElementById('countdownDays');
    // 設定出發日期 2026/05/05 04:55 集合
    const departureDate = new Date('2026-05-05T04:55:00');
    
    function updateCountdown() {
      const now = new Date();
      const diffTime = departureDate - now;
      
      if (diffTime > 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        countdownEl.textContent = diffDays;
      } else {
        countdownEl.textContent = '0';
        countdownEl.style.color = '#10b981'; // 出發啦！
      }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60 * 60); // 每小時更新
  }

  // ===== 渲染旅行儀表板 =====
  function renderDashboard() {
    const container = document.getElementById('dashboardGrid');
    if (!container) return;

    container.innerHTML = dashboardCards.map(card => `
      <article class="dashboard-card">
        <div class="dashboard-icon">${card.icon}</div>
        <div class="dashboard-card-body">
          <div class="dashboard-label">${card.label}</div>
          <div class="dashboard-value">${card.value}</div>
          <div class="dashboard-detail">${card.detail}</div>
        </div>
      </article>
    `).join('');
  }

  // ===== 天氣預測 =====
  function initWeatherForecast() {
    const refreshBtn = document.getElementById('weatherRefreshBtn');
    renderWeatherForecast();
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => renderWeatherForecast({ force: true }));
    }
  }

  async function renderWeatherForecast(options = {}) {
    const container = document.getElementById('weatherGrid');
    const refreshBtn = document.getElementById('weatherRefreshBtn');
    if (!container) return;

    container.innerHTML = weatherStops.map(stop => `
      <article class="weather-card weather-loading">
        <div class="weather-card-head">
          <div>
            <div class="weather-date">${stop.date}</div>
            <h3>${stop.area}</h3>
          </div>
          <div class="weather-icon">⌛</div>
        </div>
        <p class="weather-note">${stop.note}</p>
        <div class="weather-placeholder">讀取天氣中...</div>
      </article>
    `).join('');

    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = '更新中';
    }

    try {
      const forecasts = await Promise.all(weatherStops.map(stop => fetchWeatherForStop(stop, options.force)));
      weatherByDate = forecasts.reduce((map, stop) => {
        map[stop.date] = stop;
        return map;
      }, {});
      container.innerHTML = forecasts.map(renderWeatherCard).join('');
      renderCalendar();
    } catch (error) {
      container.innerHTML = `
        <div class="weather-error">
          天氣資料暫時讀取失敗。請確認網路連線，或稍後再按「更新天氣」。
        </div>
      `;
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = '更新天氣';
      }
    }
  }

  async function fetchWeatherForStop(stop, force = false) {
    const cacheKey = `japanTripWeather:${stop.isoDate}:${stop.area}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    const maxAgeMs = 1000 * 60 * 45;

    if (!force && cached && Date.now() - cached.savedAt < maxAgeMs) {
      return { ...stop, weather: cached.weather, cachedAt: cached.savedAt };
    }

    const params = new URLSearchParams({
      latitude: stop.lat,
      longitude: stop.lon,
      timezone: 'Asia/Tokyo',
      start_date: stop.isoDate,
      end_date: stop.isoDate,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum'
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);

    const data = await response.json();
    const daily = data.daily || {};
    const index = Array.isArray(daily.time) ? daily.time.indexOf(stop.isoDate) : -1;

    if (index === -1) {
      return { ...stop, weather: null };
    }

    const weather = {
      code: daily.weather_code?.[index],
      tempMax: daily.temperature_2m_max?.[index],
      tempMin: daily.temperature_2m_min?.[index],
      rainChance: daily.precipitation_probability_max?.[index],
      rainSum: daily.precipitation_sum?.[index]
    };

    localStorage.setItem(cacheKey, JSON.stringify({ weather, savedAt: Date.now() }));
    return { ...stop, weather, cachedAt: Date.now() };
  }

  function renderWeatherCard(stop) {
    if (!stop.weather) {
      return `
        <article class="weather-card weather-unavailable">
          <div class="weather-card-head">
            <div>
              <div class="weather-date">${stop.date}</div>
              <h3>${stop.area}</h3>
            </div>
            <div class="weather-icon">🌡️</div>
          </div>
          <p class="weather-note">${stop.note}</p>
          <div class="weather-placeholder">尚無這天的預報資料</div>
        </article>
      `;
    }

    const [icon, label] = weatherCodeMap[stop.weather.code] || ['🌡️', '天氣資料'];
    const max = formatWeatherNumber(stop.weather.tempMax, '°C');
    const min = formatWeatherNumber(stop.weather.tempMin, '°C');
    const rainChance = formatWeatherNumber(stop.weather.rainChance, '%');
    const rainSum = formatWeatherNumber(stop.weather.rainSum, ' mm');

    return `
      <article class="weather-card">
        <div class="weather-card-head">
          <div>
            <div class="weather-date">${stop.date}</div>
            <h3>${stop.area}</h3>
          </div>
          <div class="weather-icon">${icon}</div>
        </div>
        <p class="weather-note">${stop.note}</p>
        <div class="weather-main">${label}</div>
        <div class="weather-metrics">
          <div>
            <span>高/低溫</span>
            <strong>${max} / ${min}</strong>
          </div>
          <div>
            <span>降雨機率</span>
            <strong>${rainChance}</strong>
          </div>
          <div>
            <span>降雨量</span>
            <strong>${rainSum}</strong>
          </div>
        </div>
      </article>
    `;
  }

  function formatWeatherNumber(value, unit) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
    return `${Math.round(Number(value))}${unit}`;
  }

  function renderCalendarWeatherBadge(date) {
    const stop = weatherByDate[date];
    if (!stop || !stop.weather) return '<div class="calendar-weather pending">天氣讀取中</div>';

    const [icon, label] = weatherCodeMap[stop.weather.code] || ['🌡️', '天氣'];
    const max = formatWeatherNumber(stop.weather.tempMax, '°C');
    const min = formatWeatherNumber(stop.weather.tempMin, '°C');
    return `<div class="calendar-weather">${icon} ${label} · ${max}/${min}</div>`;
  }

  // ===== 渲染行前檢查清單 =====
  function renderChecklist() {
    const container = document.getElementById('checklistBoard');
    if (!container) return;

    container.innerHTML = '';
    Object.entries(checklistData).forEach(([category, items]) => {
      const checkedCount = items.filter(item => state.checklist.includes(item)).length;
      const group = document.createElement('section');
      group.className = 'checklist-group';
      group.innerHTML = `
        <div class="checklist-group-header">
          <h3>${category}</h3>
          <span>${checkedCount}/${items.length}</span>
        </div>
      `;

      const list = document.createElement('div');
      list.className = 'checklist-items';

      items.forEach(item => {
        const id = `check-${category}-${item}`.replace(/\W+/g, '-');
        const row = document.createElement('label');
        row.className = 'checklist-item';
        row.setAttribute('for', id);
        row.innerHTML = `
          <input id="${id}" type="checkbox" value="${escapeHTML(item)}" ${state.checklist.includes(item) ? 'checked' : ''}>
          <span>${escapeHTML(item)}</span>
        `;
        list.appendChild(row);
      });

      group.appendChild(list);
      container.appendChild(group);
    });

    container.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const value = e.target.value;
        if (e.target.checked) {
          if (!state.checklist.includes(value)) state.checklist.push(value);
        } else {
          state.checklist = state.checklist.filter(item => item !== value);
        }
        saveChecklist();
        renderChecklist();
      });
    });
  }

  // ===== 渲染行事曆 =====
  function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    itineraryData.forEach(itemData => {
      const cell = document.createElement('div');
      cell.className = `calendar-cell has-data cal-type-${itemData.type}`;
      
      const timeHtml = itemData.time ? `<span class="calendar-time">${itemData.time}</span>` : '';
      
      // 加上表情符號圖示
      const icons = {
        transit: '✈️',
        tokyo: '🗼',
        nagano: '🌸',
        tateyama: '❄️',
        shirakawa: '🏘️',
        fuji: '🗻'
      };
      const icon = icons[itemData.type] || '📍';

      // 計算這天有沒有未完成的待辦事項
      const uncompletedTodos = state.todos.filter(t => t.date === itemData.date && !t.completed);
      const badgeHtml = uncompletedTodos.length > 0 ? `<div class="calendar-todo-badge">${uncompletedTodos.length}</div>` : '';

      cell.innerHTML = `
        ${badgeHtml}
        <div class="calendar-date">
          <span>${itemData.date}</span>
          ${timeHtml}
        </div>
        <div class="calendar-item">
          ${icon} ${itemData.location}
        </div>
        ${renderCalendarWeatherBadge(itemData.date)}
      `;

      // 點選事件
      cell.addEventListener('click', () => openModal(itemData));
      grid.appendChild(cell);
    });

    container.appendChild(grid);
  }

  // ===== 共用渲染展開式清單函式 =====
  function renderAccordion(containerId, dataMap) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    container.className = 'accordion-container';

    Object.entries(dataMap).forEach(([category, items]) => {
      const details = document.createElement('details');
      details.className = 'accordion-item';
      
      const summary = document.createElement('summary');
      summary.className = 'accordion-header';
      summary.innerHTML = `<span class="accordion-title-text">${category}</span><span class="accordion-icon">▼</span>`;
      
      const content = document.createElement('div');
      content.className = 'accordion-content';
      
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'accordion-card';
        div.innerHTML = `
          <div class="acc-icon">${item.icon}</div>
          <div class="acc-text">
            <h4 class="acc-title">${item.title}</h4>
            <p class="acc-desc">${item.content}</p>
          </div>
        `;
        content.appendChild(div);
      });
      
      details.appendChild(summary);
      details.appendChild(content);
      container.appendChild(details);
    });
  }

  // ===== 渲染推薦 =====
  function renderRecommendations() {
    renderAccordion('recommendationsGrid', recommendationsData);
  }

    // ===== 渲染小撇步 =====
  function renderTips() {
    renderAccordion('tipsGrid', tipsData);
  }

  // ===== 渲染訂位總覽 =====
  function renderBookings() {
    const container = document.getElementById('bookingsContainer');
    if (!container) return;
    container.innerHTML = '';

    const categoryMeta = {
      transit:    { label: '交通', color: '#0284c7', bg: '#e0f2fe' },
      hotel:      { label: '住宿', color: '#7c3aed', bg: '#ede9fe' }
    };

    // 依分類分組
    const groups = {};
    bookings.forEach(b => {
      if (!groups[b.category]) groups[b.category] = [];
      groups[b.category].push(b);
    });

    const categoryOrder = ['transit', 'hotel'];
    const categoryIcons = { transit: '🚄', hotel: '🏨' };

    categoryOrder.forEach(cat => {
      const items = groups[cat];
      if (!items) return;

      const meta = categoryMeta[cat];

      const groupEl = document.createElement('details');
      groupEl.className = 'booking-group';
      if (cat === 'transit') groupEl.open = true;

      const groupHeader = document.createElement('summary');
      groupHeader.className = 'booking-group-header';
      groupHeader.innerHTML = `
        <span class="booking-cat-icon">${categoryIcons[cat]}</span>
        <span class="booking-cat-label">${meta.label}</span>
        <span class="booking-cat-count">${items.length} 筆</span>
        <span class="booking-toggle-icon" aria-hidden="true">⌄</span>
      `;
      groupEl.appendChild(groupHeader);

      const cardsWrap = document.createElement('div');
      cardsWrap.className = 'booking-cards';

      items.forEach(b => {
        const card = document.createElement('div');
        card.className = 'booking-card';

        const statusHtml = b.status === 'confirmed'
          ? '<span class="booking-status confirmed">✅ 已確認</span>'
          : '<span class="booking-status pending">⏳ 待確認</span>';

        card.innerHTML = `
          <div class="booking-left">
            <div class="booking-icon" style="background:${meta.bg}; color:${meta.color};">${b.icon}</div>
          </div>
          <div class="booking-body">
            <div class="booking-top-row">
              <div>
                <div class="booking-title">${b.title}</div>
                <div class="booking-subtitle">${b.subtitle}</div>
              </div>
              ${statusHtml}
            </div>
            <div class="booking-details">
              <div class="booking-detail-item">
                <span class="booking-detail-label">📅 日期</span>
                <span class="booking-detail-val">${b.date}</span>
              </div>
              ${b.time ? `<div class="booking-detail-item">
                <span class="booking-detail-label">🕐 時間</span>
                <span class="booking-detail-val">${b.time}</span>
              </div>` : ''}
              ${b.confirmCode ? `<div class="booking-detail-item">
                <span class="booking-detail-label">🎫 訂位代碼</span>
                <span class="booking-detail-val booking-code">${b.confirmCode}</span>
              </div>` : ''}
              ${b.price ? `<div class="booking-detail-item">
                <span class="booking-detail-label">💰 金額</span>
                <span class="booking-detail-val">${b.price}</span>
              </div>` : ''}
              ${b.passengers ? `<div class="booking-detail-item">
                <span class="booking-detail-label">👤 乘客</span>
                <span class="booking-detail-val">${b.passengers}</span>
              </div>` : ''}
            </div>
            ${b.note ? `<div class="booking-note">💡 ${b.note}</div>` : ''}
          </div>
        `;
        cardsWrap.appendChild(card);
      });

      groupEl.appendChild(cardsWrap);
      container.appendChild(groupEl);
    });

    // 若無任何訂位
    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="booking-empty">
          <div style="font-size: 3rem; margin-bottom: 16px;">🎫</div>
          <p style="color: var(--c-text-muted);">還沒有任何訂位紀錄，快去搶票吧！</p>
        </div>
      `;
    }
  }

  // ===== 渲染資料整合紀錄 =====
  function renderRegistry() {
    const tbody = document.getElementById('registryTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    dataRegistry.forEach(row => {
      const el = document.createElement('tr');
      el.style.borderBottom = '1px solid var(--c-border)';
      
      el.innerHTML = `
        <td style="padding: 12px; font-family: monospace; font-size: 0.9rem;">
          <a href="${row.url}" target="_blank" style="color: var(--c-primary-light); text-decoration: underline;">
            ${row.file}
          </a>
        </td>
        <td style="padding: 12px; font-size: 0.9rem;">${row.added}</td>
        <td style="padding: 12px; font-size: 0.9rem; color: var(--c-primary-light);">${row.integrated}</td>
        <td style="padding: 12px; font-size: 0.95rem;">${row.summary}</td>
      `;
      tbody.appendChild(el);
    });
  }

  // ===== 備忘錄系統 =====
  function initNotes() {
    const titleInput = document.getElementById('noteTitleInput');
    const textarea = document.getElementById('noteContentInput');
    const categorySelect = document.getElementById('noteCategorySelect');
    const saveBtn = document.getElementById('noteSaveBtn');
    
    const imageInput = document.getElementById('noteImageInput');
    const imagePreviewContainer = document.getElementById('noteImagePreviewContainer');
    const imagePreview = document.getElementById('noteImagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    let currentImageBase64 = null;

    // 初始渲染
    renderNotes();

    // 處理圖片的共用函式
    function processImageFile(file, previewEl, containerEl, callback) {
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // 壓縮圖片避免撐爆 localStorage
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', 0.6);
          previewEl.src = base64;
          containerEl.style.display = 'block';
          if (callback) callback(base64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    // 處理圖片上傳與壓縮 (主表單 - 點選上傳)
    if (imageInput) {
      imageInput.addEventListener('change', function(e) {
        processImageFile(e.target.files[0], imagePreview, imagePreviewContainer, (b64) => {
          currentImageBase64 = b64;
        });
      });
    }

    // 處理圖片貼上 (主表單 - Cmd+V)
    if (textarea) {
      textarea.addEventListener('paste', function(e) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
          const item = items[index];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            processImageFile(file, imagePreview, imagePreviewContainer, (b64) => {
              currentImageBase64 = b64;
            });
            // 不使用 preventDefault()，讓如果同時貼上文字與圖片時，文字依然能貼上
          }
        }
      });
    }

    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', () => {
        currentImageBase64 = null;
        imageInput.value = '';
        imagePreviewContainer.style.display = 'none';
        imagePreview.src = '';
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const content = textarea.value.trim();
        const category = categorySelect.options[categorySelect.selectedIndex];
        
        if (!title && !content && !currentImageBase64) {
          alert('請輸入備忘錄標題、內容或圖片！');
          return;
        }

        const newNote = {
          id: Date.now().toString(),
          title: title || '無標題備忘',
          content: content,
          categoryVal: category.value,
          categoryText: category.text,
          date: new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          image: currentImageBase64
        };

        state.notes.unshift(newNote); // 加到最前面
        saveNotes();
        renderNotes();
        
        // 清空輸入框
        titleInput.value = '';
        textarea.value = '';
        currentImageBase64 = null;
        if (imageInput) imageInput.value = '';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
        if (imagePreview) imagePreview.src = '';
      });
    }
  }

  function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';

    if (state.notes.length === 0) {
      list.innerHTML = `
        <div class="notes-empty" id="notesEmpty" style="display: block;">
          <div class="empty-icon">📋</div>
          <p>還沒有備忘錄</p>
          <p class="empty-sub">開始記錄你的旅遊重點吧！</p>
        </div>
      `;
      return;
    }
    
    // 類別顏色對應
    const catColors = {
      'general': 'var(--c-primary-light)',
      'todo': 'var(--c-nagano)',
      'booking': 'var(--c-transit)',
      'packing': 'var(--c-shirakawa)',
      'emergency': 'var(--c-secondary)'
    };

    state.notes.forEach(note => {
      const el = document.createElement('div');
      el.className = 'note-item';
      el.style.borderLeftColor = catColors[note.categoryVal] || 'var(--c-primary-light)';
      
      el.innerHTML = `
        <div class="note-item-header">
          <div class="note-item-title">
            <span>${note.categoryText.split(' ')[0]}</span> ${note.title}
          </div>
          <div class="note-item-meta">${note.date}</div>
        </div>
        ${note.image ? `<img src="${note.image}" class="note-image-display" style="margin-top: 10px; margin-bottom: 10px; width: 100%; border-radius: 8px; border: 1px solid var(--c-border); max-height: 300px; object-fit: contain;">` : ''}
        <div class="note-item-content">${escapeHTML(note.content)}</div>
        <div class="note-item-actions">
          <button type="button" class="note-action-btn delete" data-id="${note.id}">刪除</button>
        </div>
      `;

      list.appendChild(el);
    });

    // 綁定刪除事件
    document.querySelectorAll('.note-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id;
        // 先從 state 移除，保存備份
        const deletedNote = state.notes.find(n => n.id === id);
        const deletedIndex = state.notes.findIndex(n => n.id === id);
        if (!deletedNote) return;
        state.notes = state.notes.filter(n => n.id !== id);
        renderNotes(); // 立即更新畫面

        // 顯示 Undo Toast
        showUndoToast(
          deletedNote.title || '無標題備忘',
          () => { saveNotes(); }, // 60秒後正式儲存
          () => { // 按復原
            state.notes.splice(deletedIndex, 0, deletedNote);
            saveNotes();
            renderNotes();
          }
        );
      });
    });
  }

  function saveNotes() {
    localStorage.setItem('japanTripNotes', JSON.stringify(state.notes));
  }

  // ===== 備份與還原 =====
  function initBackupTools() {
    const exportBtn = document.getElementById('exportBackupBtn');
    const importInput = document.getElementById('importBackupInput');

    if (exportBtn) {
      exportBtn.addEventListener('click', exportBackup);
    }

    if (importInput) {
      importInput.addEventListener('change', importBackup);
    }
  }

  function exportBackup() {
    const payload = {
      app: 'japan-trip-2026',
      version: 1,
      exportedAt: new Date().toISOString(),
      notes: state.notes,
      todos: state.todos,
      checklist: state.checklist
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `japan-trip-2026-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const notes = Array.isArray(data.notes) ? data.notes : [];
        const todos = Array.isArray(data.todos) ? data.todos : [];
        const checklist = Array.isArray(data.checklist) ? data.checklist : [];
        const ok = confirm('匯入備份會覆蓋這台裝置目前的備忘、待辦與行前檢查清單。確定要匯入嗎？');
        if (!ok) return;

        state.notes = notes;
        state.todos = todos;
        state.checklist = checklist;
        saveNotes();
        saveTodos();
        saveChecklist();
        renderNotes();
        renderMasterTodoList();
        renderChecklist();
        renderCalendar();
        alert('備份已匯入完成。');
      } catch (error) {
        alert('備份檔格式不正確，請確認是從本網站匯出的 JSON 檔。');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  // ===== 待辦總表系統 =====
  function renderMasterTodoList() {
    const container = document.getElementById('todoMasterContainer');
    if (!container) return;
    
    container.innerHTML = '';

    if (state.todos.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: var(--radius-lg);">
          <h3 style="color: var(--c-text-muted); margin-bottom: 10px;">目前沒有任何待辦事項</h3>
          <p style="color: var(--c-text-muted); font-size: 0.95rem;">點選上方「行事曆」的日期卡片，即可為每一天新增專屬待辦事項！</p>
        </div>
      `;
      return;
    }

    // 將 todo 依照日期分組
    const groupedTodos = {};
    state.todos.forEach(todo => {
      if (!groupedTodos[todo.date]) {
        groupedTodos[todo.date] = [];
      }
      groupedTodos[todo.date].push(todo);
    });

    // 取得所有有待辦的日期並排序 (依照字串簡易排序 9/15 -> 10/1 可能有問題，但此行程剛好 9 月在前 10 月在後，簡易補零排序)
    const sortedDates = Object.keys(groupedTodos).sort((a, b) => {
      const [m1, d1] = a.split('/').map(Number);
      const [m2, d2] = b.split('/').map(Number);
      if (m1 !== m2) return m1 - m2;
      return d1 - d2;
    });

    sortedDates.forEach(dateStr => {
      const todosForDate = groupedTodos[dateStr];
      // 未完成排前面
      todosForDate.sort((a, b) => a.completed - b.completed);
      
      const itemData = itineraryData.find(i => i.date === dateStr);
      const locationBadge = itemData ? `<span class="todo-date-location">${itemData.location}</span>` : '';

      const groupEl = document.createElement('div');
      groupEl.className = 'todo-date-group';
      
      let html = `
        <div class="todo-date-header">
          <span>📅 ${dateStr}</span>
          ${locationBadge}
        </div>
        <div class="todo-list-container">
      `;

      todosForDate.forEach(todo => {
        html += `
          <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" class="todo-checkbox master-checkbox" data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHTML(todo.text)}</span>
            <button type="button" class="todo-delete-btn master-delete-btn" data-id="${todo.id}">🗑️</button>
          </div>
        `;
      });

      html += `</div>`;
      groupEl.innerHTML = html;
      container.appendChild(groupEl);
    });

    // 綁定事件
    document.querySelectorAll('.master-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const todo = state.todos.find(t => t.id === e.target.dataset.id);
        if (todo) {
          todo.completed = e.target.checked;
          saveTodos();
          renderMasterTodoList(); // 重新渲染總表以重排
          renderCalendar(); // 更新紅點
        }
      });
    });

    document.querySelectorAll('.master-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id;
        if (!id) return;
        // 先從 state 移除，保存備份
        const deletedTodo = state.todos.find(t => t.id === id);
        const deletedIndex = state.todos.findIndex(t => t.id === id);
        if (!deletedTodo) return;
        state.todos = state.todos.filter(t => t.id !== id);
        renderMasterTodoList();
        renderCalendar();

        // 顯示 Undo Toast
        showUndoToast(
          deletedTodo.text,
          () => { saveTodos(); }, // 60秒後正式儲存
          () => { // 按復原
            state.todos.splice(deletedIndex, 0, deletedTodo);
            saveTodos();
            renderMasterTodoList();
            renderCalendar();
          }
        );
      });
    });
  }

  // ===== Modal 互動 =====
  function openModal(itemData) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    const timeStr = itemData.time ? ` · ${itemData.time}` : '';
    
    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-date">📅 ${itemData.date} ${timeStr}</div>
        <h2 class="modal-title">${itemData.location}</h2>
      </div>
      <div class="modal-body">
        <p style="font-size: 1.2rem; color: var(--c-text); margin-bottom: 20px;"><strong>📍 計畫：</strong>${itemData.desc}</p>
        <p><strong>💡 詳細資訊：</strong><br>${itemData.detail}</p>
        
        <!-- 單日待辦事項區塊 -->
        <div class="modal-tool-panel">
          <h4 style="margin-bottom: 15px; color: var(--c-accent); display: flex; align-items: center; gap: 8px;">
            ☑️ 本日專屬待辦
          </h4>
          <div id="modalTodoList" class="todo-list-container">
            <!-- 動態渲染待辦 -->
          </div>
          <div class="todo-input-wrapper">
            <input type="text" id="modalTodoInput" class="todo-input" placeholder="新增待辦事項 (如：預約餐廳、買票)...">
            <button id="addModalTodoBtn" class="todo-add-btn">新增</button>
          </div>
        </div>

        <!-- 快速筆記區塊 -->
        <div class="modal-tool-panel">
          <h4 style="margin-bottom: 10px;">快速筆記區</h4>
          <textarea id="quickNote" class="quick-note-input" placeholder="點此輸入針對此行程的特定筆記，或直接按 Cmd+V 貼上圖片..."></textarea>
          
          <div class="file-upload-wrapper" style="margin-bottom: 12px;">
            <label for="quickNoteImage" class="upload-btn" style="padding: 4px 10px; font-size: 0.85rem;">📷 附加圖片 (可直接貼上)</label>
            <input type="file" id="quickNoteImage" accept="image/*" style="display: none;">
            <div id="quickNotePreviewContainer" style="display: none; margin-top: 10px; position: relative;">
              <img id="quickNotePreview" src="" style="width: 100%; border-radius: 4px; max-height: 200px; object-fit: contain; border: 1px solid var(--c-border);">
              <button type="button" id="removeQuickNoteImage" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">✕</button>
            </div>
          </div>

          <button id="saveQuickNoteBtn" style="padding:6px 12px; background:var(--c-primary-light); color:white; border:none; border-radius:4px; font-size:0.9rem; cursor: pointer;">儲存筆記</button>
        </div>
      </div>
    `;
    
    overlay.classList.add('active');

    // --- 待辦事項邏輯 ---
    function renderModalTodos() {
      const listContainer = document.getElementById('modalTodoList');
      listContainer.innerHTML = '';
      
      const dayTodos = state.todos.filter(t => t.date === itemData.date);
      
      // 未完成排前面，已完成排後面
      dayTodos.sort((a, b) => a.completed - b.completed);

      if (dayTodos.length === 0) {
        listContainer.innerHTML = '<p style="color: var(--c-text-muted); font-size: 0.9rem; text-align: center;">目前沒有待辦事項</p>';
      } else {
        dayTodos.forEach(todo => {
          const el = document.createElement('div');
          el.className = `todo-item ${todo.completed ? 'completed' : ''}`;
          el.innerHTML = `
            <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHTML(todo.text)}</span>
            <button type="button" class="todo-delete-btn" data-id="${todo.id}">🗑️</button>
          `;
          listContainer.appendChild(el);
        });
      }

      // 綁定事件
      document.querySelectorAll('#modalTodoList .todo-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const todo = state.todos.find(t => t.id === e.target.dataset.id);
          if (todo) {
            todo.completed = e.target.checked;
            saveTodos();
            renderModalTodos();
            renderCalendar(); // 更新日曆紅點
            renderMasterTodoList(); // 更新總表
          }
        });
      });

      document.querySelectorAll('#modalTodoList .todo-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          if (!id) return;
          state.todos = state.todos.filter(t => t.id !== id);
          saveTodos();
          renderModalTodos();
          renderCalendar();
          renderMasterTodoList();
        });
      });
    }

    renderModalTodos();

    document.getElementById('addModalTodoBtn').addEventListener('click', () => {
      const input = document.getElementById('modalTodoInput');
      const text = input.value.trim();
      if (!text) return;

      state.todos.push({
        id: Date.now().toString(),
        date: itemData.date,
        text: text,
        completed: false
      });

      saveTodos();
      input.value = '';
      renderModalTodos();
      renderCalendar();
      renderMasterTodoList();
    });

    document.getElementById('modalTodoInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('addModalTodoBtn').click();
      }
    });

    // --- 快速筆記區的互動邏輯 ---
    const imageInput = document.getElementById('quickNoteImage');
    const previewContainer = document.getElementById('quickNotePreviewContainer');
    const previewImg = document.getElementById('quickNotePreview');
    const removeBtn = document.getElementById('removeQuickNoteImage');
    const quickNoteTextarea = document.getElementById('quickNote');
    let quickBase64Image = null;

    function processQuickImageFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          quickBase64Image = canvas.toDataURL('image/jpeg', 0.6);
          previewImg.src = quickBase64Image;
          previewContainer.style.display = 'block';
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    // 點選上傳
    imageInput.addEventListener('change', function(e) {
      processQuickImageFile(e.target.files[0]);
    });

    // 貼上圖片 (Cmd+V)
    quickNoteTextarea.addEventListener('paste', function(e) {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          processQuickImageFile(file);
        }
      }
    });

    removeBtn.addEventListener('click', () => {
      quickBase64Image = null;
      imageInput.value = '';
      previewContainer.style.display = 'none';
    });

    document.getElementById('saveQuickNoteBtn').addEventListener('click', () => {
      const content = document.getElementById('quickNote').value.trim();
      if (!content && !quickBase64Image) {
        alert('請輸入內容或上傳圖片！');
        return;
      }

      const newNote = {
        id: Date.now().toString(),
        title: `${itemData.location} (${itemData.date})`,
        content: content,
        categoryVal: 'general',
        categoryText: '📌 快速筆記',
        date: new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        image: quickBase64Image
      };

      state.notes.unshift(newNote);
      saveNotes();
      
      // 如果 renderNotes 存在 (即在有備忘錄列表的頁面)
      if (typeof renderNotes === 'function') {
        renderNotes();
      }
      
      alert('已成功儲存至底部的「旅行備忘錄」中！');
      document.getElementById('modalOverlay').classList.remove('active');
    });
  }

  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.remove('active');
  });

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.remove('active');
    }
  });

  // ===== 回到頂部 =====
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 工具函式：防止 XSS
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag])
    );
  }
});
