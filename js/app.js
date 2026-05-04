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
    {
      date: '5/5', day: 'DAY 1', weekday: '一', location: '東京/成田', type: 'tokyo',
      desc: '高雄出發 → 東京成田機場 → 成田山新勝寺 → 表參道',
      route: '高雄小港 T1 ✈ 成田 T2 → 成田山新勝寺 → 表參道 → 飯店',
      meals: { breakfast: '—', lunch: '機上美食', dinner: '新勝寺表參道自理' },
      hotel: { name: '成田國際花園飯店', addr: '千葉県成田市吉倉241-1', tel: '0476-23-5522' },
      spots: [
        { name: '✈️ CI 102 航班', text: '高雄 07:55 出發 → 成田 12:35 抵達。集合時間 04:55，高雄小港機場 T1 中華航空團體櫃台。' },
        { name: '⛩️ 成田山新勝寺', text: '成田機場附近最具代表性的寺院，開基於 940 年，是真言宗智山派的大本山。正殿、三重塔、仁王門等建築氣勢壯觀。' },
        { name: '🏮 成田山表參道', text: '從 JR 成田站延伸至新勝寺約 800 公尺的參道。兩旁林立著鰻魚飯名店、和菓子鋪與伴手禮店，可以品嚐現烤仙貝。' }
      ],
      shopping: '飯店一樓有 <b>7-11</b>，步行 1 分有 Mini-Stop。大型超市需搭飯店免費接駁車至 <b>Aeon Mall 成田</b>。',
      detail: '班機：CI 102 (07:55 KHH T1 → 12:35 NRT T2)。抵達後前往成田山新勝寺與表參道散策。'
    },
    {
      date: '5/6', day: 'DAY 2', weekday: '二', location: '足利/白馬', type: 'nagano',
      desc: 'CNN 十大夢幻景點・足利紫藤花卉公園 → 白馬山麓 → 長野溫泉',
      route: '飯店 → 足利紫藤花卉公園 → 白馬山麓地區 → 長野溫泉',
      meals: { breakfast: '飯店內享用', lunch: '足利大藤物語便當', dinner: '迎賓宴會自助餐或會席料理' },
      hotel: { name: '栂池太陽廣場溫泉飯店 ♨️', addr: '長野県北安曇郡小谷村千国乙12840-146', tel: '0261-83-2423' },
      spots: [
        { name: '🌸 足利紫藤花卉公園', text: '園區佔地 8.2 萬平方公尺，約 300 棵紫藤。最受矚目的「大藤」共 3 株、樹齡超過 130 年，藤架範圍廣達 600 個榻榻米，垂掛的花穗宛如紫色瀑布！花期：4 月中旬～5 月中旬。被 CNN 嚴選為全球十大最夢幻景點。' },
        { name: '🏔️ 白馬山麓地區', text: '有「日本小瑞士」美譽，曾是 1988 年長野冬季奧運會場。位於海拔 3000 公尺的北阿爾卑斯山麓，擁有 9 座大型滑雪場。' },
        { name: '♨️ 長野溫泉', text: '長野縣素有「日本屋脊」之稱，位於本州中部。縣內既有險峻高山，又有開闊高原，自古受東西文化雙重影響。' }
      ],
      shopping: '飯店附近為溫泉/滑雪街，可買信州蘋果點心、七味粉等。大型超市 DELiCiA 在白馬市區，步行無法抵達。',
      detail: '⚠️ 藤花賞花季：4 月中旬～5 月中下旬。依天候因素影響，花況無法完全保證。'
    },
    {
      date: '5/7', day: 'DAY 3', weekday: '三', location: '黑部立山', type: 'tateyama',
      desc: '立山黑部阿爾卑斯之路（6 種交通工具）→ 兼六園 → 金澤城公園',
      route: '扇澤 → 黑部水壩 → 黑部湖 → 黑部平 → 大觀峰 → 室堂‧雪之大谷 → 美女平 → 立山 → 兼六園',
      meals: { breakfast: '飯店內享用', lunch: '北陸海鮮精緻御膳', dinner: '日式風味餐' },
      hotel: { name: '金澤站前露櫻溫泉飯店 ♨️', addr: '石川県金沢市昭和町22-5', tel: '050-5576-8105' },
      spots: [
        { name: '🚌 關電隧道電氣巴士', text: '扇澤→黑部大壩 6.1km/16分。電力與氣壓並用的環保巴士。' },
        { name: '🏗️ 黑部水壩', text: '徒步穿越日本最大拱形水壩，壩頂展望台可俯瞰黑部湖全景。' },
        { name: '🚡 黑部隧道電纜車', text: '黑部湖→黑部平 0.8km/5分。日本唯一在隧道中行走的電纜車，高低差 377m、坡度約 30 度。' },
        { name: '🚠 立山空中纜車', text: '黑部平→大觀峰 1.7km/7分。日本第一長，中間無支柱，四面全景「移動的展望台」。' },
        { name: '🚎 立山隧道電軌車', text: '大觀峰→室堂 3.7km/10分。日本最高隧道，標高 2450m，貫穿立山主峰雄山。' },
        { name: '❄️ 室堂・雪之大谷', text: '春季限定！雪車開出的道路兩旁雪壁高達近 20 公尺，極為壯觀。開放至 6 月下旬。' },
        { name: '🚌 高原巴士', text: '室堂→美女平 23km/50分。Park Line 景觀道路，沿途林相豐富。' },
        { name: '🚋 立山電纜車', text: '美女平→立山驛 1.3km/7分。高低差 500m。' },
        { name: '🏯 兼六園', text: '日本三大名園之一，精緻的迴遊式庭園。' },
        { name: '🏯 金澤城公園', text: '加賀百萬石的城堡，日式金澤城公園。' }
      ],
      shopping: '金澤車站內 100ban Mart、KAJIMART。伴手禮推薦「金澤百番街 Anto」(金鍔、和菓子、海鮮)。',
      detail: '※ 立山實際開放時間需視天候及安全狀況，導遊將視情況調整。穿越 6 種交通工具橫跨北阿爾卑斯山脈！'
    },
    {
      date: '5/8', day: 'DAY 4', weekday: '四', location: '白川鄉/上高地', type: 'shirakawa',
      desc: '白川鄉合掌村（世界遺產）→ 上高地（大正池、河童橋）',
      route: '飯店 → 白川鄉合掌村 → 上高地（大正池、穗高連峰、河童橋）→ 飯店',
      meals: { breakfast: '飯店內早餐', lunch: '飛驒牛御膳 🥩', dinner: '飯店迎賓式會席料理' },
      hotel: { name: '緣之杜山中湖溫泉飯店 ♨️', addr: '山梨県南都留郡山中湖村山中207-1', tel: '0555-72-8084' },
      spots: [
        { name: '🏘️ 白川鄉合掌村', text: '1995 年入選聯合國世界遺產。全村百餘幢茅草合掌屋，全部人手興建不用一根釘。屋頂呈 60 度正三角形，可承載厚重積雪。300 年歷史的獨特建築。' },
        { name: '🏞️ 上高地・大正池', text: '被日本人視作「神的故鄉」，標高約 1500m。四周被燒岳、常念山脈、穗高連峰環抱，被指定為國家文化財產。' },
        { name: '🌉 河童橋', text: '上高地最具代表性的地標，橫跨梓川的木造吊橋。可眺望穗高連峰與燒岳，是拍照絕佳地點。' }
      ],
      shopping: '⚠️ 此區超商較遠，建議在前往飯店前先買好零食與飲料！',
      detail: '※ 上高地 7～10 月旺季會實施入山管制。預計開放日：2026/04/17 起。若因天候無法前往，將改為高山飛驒古街。'
    },
    {
      date: '5/9', day: 'DAY 5', weekday: '五', location: '富士山/大宮', type: 'fuji',
      desc: '西湖夢幻合掌村落 → 河口湖遠眺富士山 → 忍野八海 → 淺間神社',
      route: '飯店 → 西湖里根場合掌村 → 富士河口湖 → 忍野八海 → 淺間神社 → 大宮',
      meals: { breakfast: '飯店內用', lunch: '河口湖散策自理', dinner: '和牛壽喜燒套餐 🥩' },
      hotel: { name: 'Daiwa Roynet Hotel 大宮西口', addr: '埼玉県さいたま市大宮区桜木町1丁目398-1', tel: '048-779-8475' },
      spots: [
        { name: '🏡 西湖里根場合掌村', text: '富士河口湖最有人氣的觀光名勝。茅草屋頂面向富士山而建，20 間民宅部分改為展覽館，還有手工藝體驗工作室。' },
        { name: '🗻 河口湖', text: '富士五湖之一，天氣好時可看到「逆富士」（湖面倒映的富士山），美不勝收。' },
        { name: '💧 忍野八海', text: '富士山雪水經地層數十年過濾而成的 8 座湧泉池。日本名水百選、天然記念物及新富岳百景之一。' },
        { name: '⛩️ 淺間神社', text: '供奉淺間大神（火之神、山之神）。建築風格典雅，周圍環繞美麗的自然景觀。' }
      ],
      shopping: '大宮站超好逛！Aeon Style、成城石井、Maruetsu (深夜)。步行可達 <b>BIC CAMERA</b>、ecute 大宮、SOGO 地下街。',
      detail: '今天從山區回到都市，大宮站附近採買非常方便，把握大型超市機會！'
    },
    {
      date: '5/10', day: 'DAY 6', weekday: '六', location: '川越/東京', type: 'tokyo',
      desc: '小江戶川越・菓子屋橫町・冰川神社 → 台場 DiverCity 鋼彈',
      route: '飯店 → 川越（菓子屋橫町、時之鐘、冰川神社）→ 免稅店 → DiverCity Tokyo Plaza → 淺草橋',
      meals: { breakfast: '飯店內早餐', lunch: '川越老街散策自理', dinner: '雞肉相撲火鍋味噌烤雞套餐' },
      hotel: { name: '露櫻 Grand 東京淺草橋溫泉飯店 ♨️', addr: '東京都台東区浅草橋2-29-14', tel: '050-5864-0363' },
      spots: [
        { name: '🏯 小江戶川越', text: '完整保留江戶時期古老歷史。青磚瓦片倉庫群、百年老店林立。與江戶城、岩槻城並列關東三城，又名「小江戶」。' },
        { name: '🍬 菓子屋橫町', text: '充滿懷舊風味的糖果街，各式傳統日式零食與點心琳瑯滿目。' },
        { name: '🔔 時之鐘', text: '川越象徵性地標，約 400 年歷史的鐘樓，每天仍會定時敲鐘。' },
        { name: '⛩️ 冰川神社', text: '創建於約 1500 年前。以「家庭圓滿」「締結姻緣」聞名。帶回境內白色小石子可締結好姻緣。本殿精緻雕刻。' },
        { name: '🤖 台場 DiverCity', text: '東京臨海副都心大型商業設施，入口處巨大鋼彈戰士模型。集結品牌、美食廣場與娛樂設施。' }
      ],
      shopping: '步行 100m 有肉之 Hanamasa (24H)、My Basket。JR 1 站至<b>秋葉原</b> Yodobashi。淺草線 1 站至<b>淺草</b>仲見世商店街。',
      detail: '行程豐富：白天古都川越、傍晚現代台場，晚上住淺草橋交通超方便！'
    },
    {
      date: '5/11', day: 'DAY 7', weekday: '日', location: '賦歸', type: 'transit',
      desc: '成田機場 → 高雄小港機場，帶著回憶回家！',
      route: '飯店 → 成田機場 T2 → 高雄小港機場 T1',
      meals: { breakfast: '飯店內美食', lunch: '機上餐', dinner: '—' },
      hotel: { name: '溫暖的家 🏠', addr: '', tel: '' },
      spots: [
        { name: '✈️ CI 103 航班', text: '成田 13:35 出發 → 高雄 16:40 抵達。建議提早 3 小時到機場進行最後採買。' },
        { name: '🛍️ 成田 T2 免稅店', text: '必買：<b>NewYork Perfect Cheese</b>、<b>楓糖男孩</b>、<b>Press Butter Sand</b>、<b>東京芭娜娜</b>限定款。' }
      ],
      shopping: '成田 T2 免稅區是最後採買機會！建議先排好優先購買清單。',
      detail: '早餐後整理行裝，可自由參觀購物後前往機場。本次旅程終告結束，期待再相會！'
    }
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
  initDisclaimer();
  initNavbar();
  initCountdown();

  initWeatherForecast();
  renderCalendar();
  renderChecklist();
  renderRecommendations();
  renderTips();
  renderBookings();
  renderRegistry();
  initNotes();
  initBackupTools();
  initBackToTop();

  // ===== 免責聲明遮罩處理 =====
  function initDisclaimer() {
    const overlay = document.getElementById('disclaimerOverlay');
    const acceptBtn = document.getElementById('disclaimerAcceptBtn');
    const isAccepted = localStorage.getItem('japanTripDisclaimerAccepted');

    if (!isAccepted) {
      overlay.classList.add('show');
      document.body.classList.add('disclaimer-active');
    }

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('japanTripDisclaimerAccepted', 'true');
      overlay.classList.remove('show');
      document.body.classList.remove('disclaimer-active');
      window.scrollTo(0, 0);
    });
  }

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
      const icons = { transit: '✈️', tokyo: '🗼', nagano: '🌸', tateyama: '❄️', shirakawa: '🏘️', fuji: '🗻' };
      const icon = icons[itemData.type] || '📍';
      const uncompletedTodos = state.todos.filter(t => t.date === itemData.date && !t.completed);
      const badgeHtml = uncompletedTodos.length > 0 ? `<div class="calendar-todo-badge">${uncompletedTodos.length}</div>` : '';
      const mealsPreview = itemData.meals
        ? `<div class="cal-meals">🍽️ ${itemData.meals.lunch}${itemData.meals.dinner !== '—' ? ' / ' + itemData.meals.dinner : ''}</div>`
        : '';
      const spotCount = itemData.spots ? itemData.spots.length : 0;
      const spotBadge = spotCount > 0 ? `<span class="cal-spot-count">📍 ${spotCount} 景點</span>` : '';

      cell.innerHTML = `
        ${badgeHtml}
        <div class="cal-day-badge">${itemData.day || ''}</div>
        <div class="calendar-date"><span>${itemData.date} (${itemData.weekday || ''})</span></div>
        <div class="calendar-item">${icon} ${itemData.location}</div>
        <div class="cal-desc">${itemData.desc}</div>
        ${mealsPreview}
        <div class="cal-bottom-row">${spotBadge}${renderCalendarWeatherBadge(itemData.date)}</div>
      `;
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

    // 景點區塊
    let spotsHtml = '';
    if (itemData.spots && itemData.spots.length > 0) {
      spotsHtml = `<div class="modal-section"><h4 class="modal-section-title">📍 景點介紹</h4><div class="modal-spots-list">${itemData.spots.map(s => `<details class="modal-spot-item"><summary class="modal-spot-name">${s.name}</summary><p class="modal-spot-text">${s.text}</p></details>`).join('')}</div></div>`;
    }
    // 餐食區塊
    let mealsHtml = '';
    if (itemData.meals) {
      mealsHtml = `<div class="modal-section"><h4 class="modal-section-title">🍽️ 今日餐食</h4><div class="modal-meals-grid"><div class="modal-meal-item"><span class="meal-label">早餐</span><span class="meal-value">${itemData.meals.breakfast}</span></div><div class="modal-meal-item"><span class="meal-label">午餐</span><span class="meal-value">${itemData.meals.lunch}</span></div><div class="modal-meal-item"><span class="meal-label">晚餐</span><span class="meal-value">${itemData.meals.dinner}</span></div></div></div>`;
    }
    // 住宿區塊
    let hotelHtml = '';
    if (itemData.hotel && itemData.hotel.name) {
      hotelHtml = `<div class="modal-section"><h4 class="modal-section-title">🏨 住宿</h4><div class="modal-hotel-card"><div class="modal-hotel-name">${itemData.hotel.name}</div>${itemData.hotel.addr ? `<div class="modal-hotel-addr">📍 ${itemData.hotel.addr}</div>` : ''}${itemData.hotel.tel ? `<div class="modal-hotel-tel">📞 <a href="tel:${itemData.hotel.tel}">${itemData.hotel.tel}</a></div>` : ''}</div></div>`;
    }
    // 採買區塊
    let shoppingHtml = '';
    if (itemData.shopping) {
      shoppingHtml = `<div class="modal-section"><h4 class="modal-section-title">🛍️ 附近採買</h4><div class="modal-shopping-text">${itemData.shopping}</div></div>`;
    }

    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-day-label">${itemData.day || ''}</div>
        <div class="modal-date">📅 ${itemData.date} (${itemData.weekday || ''})</div>
        <h2 class="modal-title">${itemData.location}</h2>
        <p class="modal-desc">${itemData.desc}</p>
      </div>
      <div class="modal-body">
        ${itemData.route ? `<div class="modal-section"><h4 class="modal-section-title">🗺️ 今日路線</h4><div class="modal-route">${itemData.route}</div></div>` : ''}
        ${spotsHtml}
        ${mealsHtml}
        ${hotelHtml}
        ${shoppingHtml}
        ${itemData.detail ? `<div class="modal-section"><h4 class="modal-section-title">💡 備註</h4><p class="modal-detail-text">${itemData.detail}</p></div>` : ''}
        <!-- 單日待辦事項區塊 -->
        <div class="modal-tool-panel">
          <h4 style="margin-bottom: 15px; color: var(--c-accent); display: flex; align-items: center; gap: 8px;">☑️ 本日專屬待辦</h4>
          <div id="modalTodoList" class="todo-list-container"></div>
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
