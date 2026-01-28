// 現在表示している年月
let currentYear;
let currentMonth;

// 選択中の日付
let selectedDate = null;

// 習慣リスト（絵文字とラベル）
const habits = [
  { emoji: '📚', label: '読書' },
  { emoji: '🏃', label: '運動' },
  { emoji: '✍️', label: '勉強' },
  { emoji: '🧘', label: '瞑想' },
  { emoji: '💪', label: '筋トレ' },
  { emoji: '🎨', label: '創作活動' }
];

// 記録データ（日付をキーにして絵文字を保存）
let records = {};

// 初期化
function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();

  // localStorageからデータを読み込み
  loadRecords();

  renderCalendar();

  // イベントリスナー
  document.getElementById('prev-month').addEventListener('click', prevMonth);
  document.getElementById('next-month').addEventListener('click', nextMonth);
  document.getElementById('popup-close').addEventListener('click', closePopup);
  document.getElementById('popup-overlay').addEventListener('click', function(e) {
    if (e.target === this) closePopup();
  });
}

// localStorageからデータを読み込み
function loadRecords() {
  const saved = localStorage.getItem('diary-calendar-records');
  if (saved) {
    records = JSON.parse(saved);
  }
}

// localStorageにデータを保存
function saveRecords() {
  localStorage.setItem('diary-calendar-records', JSON.stringify(records));
}

// 日付キーを生成（YYYY-MM-DD形式）
function getDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// カレンダーを描画
function renderCalendar() {
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // ヘッダーの年月を更新
  document.getElementById('current-month').textContent =
    `${currentYear}年 ${monthNames[currentMonth]}`;

  // 日付エリアをクリア
  const daysContainer = document.getElementById('calendar-days');
  daysContainer.innerHTML = '';

  // 月の最初の日と最後の日を取得
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // 前月の日を表示
  const firstDayOfWeek = firstDay.getDay();
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const dayElement = createDayElement(day, true, (firstDayOfWeek - 1 - i) % 7, false, prevYear, prevMonth);
    daysContainer.appendChild(dayElement);
  }

  // 今日の日付
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  // 当月の日を表示
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const isToday = isCurrentMonth && today.getDate() === day;
    const dayElement = createDayElement(day, false, dayOfWeek, isToday, currentYear, currentMonth);
    daysContainer.appendChild(dayElement);
  }

  // 次月の日を表示（6行分埋める）
  const totalCells = firstDayOfWeek + lastDay.getDate();
  const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  for (let day = 1; day <= remainingCells; day++) {
    const dayOfWeek = (firstDayOfWeek + lastDay.getDate() + day - 1) % 7;
    const dayElement = createDayElement(day, true, dayOfWeek, false, nextYear, nextMonth);
    daysContainer.appendChild(dayElement);
  }
}

// 日付要素を作成
function createDayElement(day, isOtherMonth, dayOfWeek, isToday, year, month) {
  const dayElement = document.createElement('div');
  dayElement.classList.add('day');

  // 日付の数字
  const dayNumber = document.createElement('span');
  dayNumber.classList.add('day-number');
  dayNumber.textContent = day;
  dayElement.appendChild(dayNumber);

  // 絵文字表示エリア
  const dateKey = getDateKey(year, month, day);
  const emojiSpan = document.createElement('span');
  emojiSpan.classList.add('day-emoji');
  if (records[dateKey]) {
    emojiSpan.textContent = records[dateKey];
  }
  dayElement.appendChild(emojiSpan);

  if (isOtherMonth) {
    dayElement.classList.add('other-month');
  }

  if (isToday) {
    dayElement.classList.add('today');
  } else {
    if (dayOfWeek === 0) {
      dayElement.classList.add('sunday');
    }
    if (dayOfWeek === 6) {
      dayElement.classList.add('saturday');
    }
  }

  // クリックイベント（当月の日付のみ）
  if (!isOtherMonth) {
    dayElement.addEventListener('click', function() {
      openPopup(year, month, day);
    });
  }

  return dayElement;
}

// ポップアップを開く
function openPopup(year, month, day) {
  selectedDate = { year, month, day };

  // 日付を表示
  document.getElementById('popup-date').textContent =
    `${year}年${month + 1}月${day}日`;

  // 習慣リストを生成
  const habitList = document.getElementById('habit-list');
  habitList.innerHTML = '';

  habits.forEach(habit => {
    const item = document.createElement('div');
    item.classList.add('habit-item');
    item.innerHTML = `
      <span class="emoji">${habit.emoji}</span>
      <span class="label">${habit.label}</span>
    `;
    item.addEventListener('click', function() {
      selectHabit(habit.emoji);
    });
    habitList.appendChild(item);
  });

  // クリアボタンを追加
  const clearItem = document.createElement('div');
  clearItem.classList.add('habit-item', 'clear');
  clearItem.innerHTML = `
    <span class="emoji">🗑️</span>
    <span class="label">クリア</span>
  `;
  clearItem.addEventListener('click', function() {
    selectHabit(null);
  });
  habitList.appendChild(clearItem);

  // ポップアップを表示
  document.getElementById('popup-overlay').classList.add('active');
}

// ポップアップを閉じる
function closePopup() {
  document.getElementById('popup-overlay').classList.remove('active');
  selectedDate = null;
}

// 習慣を選択
function selectHabit(emoji) {
  if (selectedDate) {
    const dateKey = getDateKey(selectedDate.year, selectedDate.month, selectedDate.day);

    if (emoji) {
      records[dateKey] = emoji;
    } else {
      delete records[dateKey];
    }

    saveRecords();
    renderCalendar();
  }
  closePopup();
}

// 前月へ
function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

// 次月へ
function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

// 初期化実行
document.addEventListener('DOMContentLoaded', init);
