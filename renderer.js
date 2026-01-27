// 現在表示している年月
let currentYear;
let currentMonth;

// 初期化
function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();

  renderCalendar();

  // イベントリスナー
  document.getElementById('prev-month').addEventListener('click', prevMonth);
  document.getElementById('next-month').addEventListener('click', nextMonth);
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

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const dayElement = createDayElement(day, true, (firstDayOfWeek - 1 - i) % 7);
    daysContainer.appendChild(dayElement);
  }

  // 今日の日付
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  // 当月の日を表示
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const isToday = isCurrentMonth && today.getDate() === day;
    const dayElement = createDayElement(day, false, dayOfWeek, isToday);
    daysContainer.appendChild(dayElement);
  }

  // 次月の日を表示（6行分埋める）
  const totalCells = firstDayOfWeek + lastDay.getDate();
  const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;

  for (let day = 1; day <= remainingCells; day++) {
    const dayOfWeek = (firstDayOfWeek + lastDay.getDate() + day - 1) % 7;
    const dayElement = createDayElement(day, true, dayOfWeek);
    daysContainer.appendChild(dayElement);
  }
}

// 日付要素を作成
function createDayElement(day, isOtherMonth, dayOfWeek, isToday = false) {
  const dayElement = document.createElement('div');
  dayElement.classList.add('day');
  dayElement.textContent = day;

  if (isOtherMonth) {
    dayElement.classList.add('other-month');
  }

  if (isToday) {
    dayElement.classList.add('today');
  } else {
    // 日曜日
    if (dayOfWeek === 0) {
      dayElement.classList.add('sunday');
    }
    // 土曜日
    if (dayOfWeek === 6) {
      dayElement.classList.add('saturday');
    }
  }

  return dayElement;
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
