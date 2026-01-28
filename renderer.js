// 現在表示している年月
let currentYear;
let currentMonth;

// 選択中の日付
let selectedDate = null;

// 絵文字選択対象のインデックス
let emojiTargetIndex = null;

// 削除確認対象のインデックス
let deleteTargetIndex = null;

// 1日に登録できる習慣の最大数
const MAX_HABITS_PER_DAY = 4;

// 選択可能な絵文字リスト
const availableEmojis = [
  '📚', '🏃', '✍️', '🧘', '💪', '🎨',
  '🎵', '🎮', '💻', '📝', '🍳', '🧹',
  '💤', '💊', '🚰', '🥗', '🚶', '🚴',
  '🏊', '⚽', '🎾', '🏀', '📖', '✏️',
  '🎯', '💡', '🌱', '🌸', '⭐', '❤️'
];

// デフォルトの習慣リスト
const defaultHabits = [
  { emoji: '📚', label: '読書' },
  { emoji: '🏃', label: '運動' },
  { emoji: '✍️', label: '勉強' },
  { emoji: '🧘', label: '瞑想' },
  { emoji: '💪', label: '筋トレ' },
  { emoji: '🎨', label: '創作活動' }
];

// 習慣リスト（絵文字とラベル）
let habits = [];

// 記録データ（日付をキーにして絵文字の配列を保存）
let records = {};

// 初期化
function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();

  // localStorageからデータを読み込み
  loadData();

  renderCalendar();

  // イベントリスナー
  document.getElementById('prev-month').addEventListener('click', prevMonth);
  document.getElementById('next-month').addEventListener('click', nextMonth);
  document.getElementById('popup-close').addEventListener('click', closePopup);
  document.getElementById('popup-overlay').addEventListener('click', function(e) {
    if (e.target === this) closePopup();
  });

  // 習慣管理モーダルのイベントリスナー
  document.getElementById('manage-habits-btn').addEventListener('click', openManageModal);
  document.getElementById('manage-modal-close').addEventListener('click', closeManageModal);
  document.getElementById('manage-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeManageModal();
  });
  document.getElementById('add-habit-btn').addEventListener('click', addNewHabit);

  // 絵文字選択モーダルのイベントリスナー
  document.getElementById('emoji-modal-close').addEventListener('click', closeEmojiModal);
  document.getElementById('emoji-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeEmojiModal();
  });

  // 確認モーダルのイベントリスナー
  document.getElementById('confirm-modal-close').addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-cancel').addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-ok').addEventListener('click', confirmDelete);
  document.getElementById('confirm-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeConfirmModal();
  });

  // 絵文字グリッドを初期化
  initEmojiGrid();
}

// localStorageからデータを読み込み
function loadData() {
  // 習慣リストを読み込み
  const savedHabits = localStorage.getItem('diary-calendar-habits');
  if (savedHabits) {
    habits = JSON.parse(savedHabits);
  } else {
    habits = [...defaultHabits];
  }

  // 記録を読み込み
  const savedRecords = localStorage.getItem('diary-calendar-records');
  if (savedRecords) {
    const loadedRecords = JSON.parse(savedRecords);
    // 古い形式（文字列）から新しい形式（配列）に変換
    for (const key in loadedRecords) {
      if (typeof loadedRecords[key] === 'string') {
        records[key] = [loadedRecords[key]];
      } else {
        records[key] = loadedRecords[key];
      }
    }
  }
}

// 習慣リストを保存
function saveHabits() {
  localStorage.setItem('diary-calendar-habits', JSON.stringify(habits));
}

// 記録を保存
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
  const prevMonthNum = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const dayElement = createDayElement(day, true, (firstDayOfWeek - 1 - i) % 7, false, prevYear, prevMonthNum);
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
  const nextMonthNum = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  for (let day = 1; day <= remainingCells; day++) {
    const dayOfWeek = (firstDayOfWeek + lastDay.getDate() + day - 1) % 7;
    const dayElement = createDayElement(day, true, dayOfWeek, false, nextYear, nextMonthNum);
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

  // 絵文字表示エリア（複数対応）
  const dateKey = getDateKey(year, month, day);
  const emojisContainer = document.createElement('div');
  emojisContainer.classList.add('day-emojis');

  const emojis = records[dateKey] || [];
  for (let i = 0; i < MAX_HABITS_PER_DAY; i++) {
    const emojiSpan = document.createElement('span');
    emojiSpan.classList.add('day-emoji');
    if (emojis[i]) {
      emojiSpan.textContent = emojis[i];
    }
    emojisContainer.appendChild(emojiSpan);
  }
  dayElement.appendChild(emojisContainer);

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
  const dateKey = getDateKey(year, month, day);
  const selectedEmojis = records[dateKey] || [];

  // 日付を表示
  document.getElementById('popup-date').textContent =
    `${year}年${month + 1}月${day}日`;

  // 習慣リストを生成
  const habitList = document.getElementById('habit-list');
  habitList.innerHTML = '';

  // 上限情報を表示
  const limitInfo = document.createElement('div');
  limitInfo.classList.add('habit-limit-info');
  limitInfo.textContent = `${selectedEmojis.length} / ${MAX_HABITS_PER_DAY} 個選択中`;
  habitList.appendChild(limitInfo);

  habits.forEach(habit => {
    const item = document.createElement('div');
    item.classList.add('habit-item');

    const isSelected = selectedEmojis.includes(habit.emoji);
    if (isSelected) {
      item.classList.add('selected');
    }

    item.innerHTML = `
      <span class="emoji">${habit.emoji}</span>
      <span class="label">${habit.label}</span>
    `;
    item.addEventListener('click', function() {
      toggleHabit(habit.emoji);
    });
    habitList.appendChild(item);
  });

  // 全クリアボタンを追加
  if (selectedEmojis.length > 0) {
    const clearItem = document.createElement('div');
    clearItem.classList.add('habit-item', 'clear');
    clearItem.innerHTML = `
      <span class="emoji">🗑️</span>
      <span class="label">すべてクリア</span>
    `;
    clearItem.addEventListener('click', function() {
      clearAllHabits();
    });
    habitList.appendChild(clearItem);
  }

  // ポップアップを表示
  document.getElementById('popup-overlay').classList.add('active');
}

// ポップアップを閉じる
function closePopup() {
  document.getElementById('popup-overlay').classList.remove('active');
  selectedDate = null;
}

// 習慣をトグル（選択/解除）
function toggleHabit(emoji) {
  if (!selectedDate) return;

  const dateKey = getDateKey(selectedDate.year, selectedDate.month, selectedDate.day);
  let emojis = records[dateKey] || [];

  const index = emojis.indexOf(emoji);
  if (index > -1) {
    // 既に選択されている場合は削除
    emojis.splice(index, 1);
  } else {
    // 選択されていない場合は追加（上限チェック）
    if (emojis.length >= MAX_HABITS_PER_DAY) {
      return; // 上限に達している場合は何もしない
    }
    emojis.push(emoji);
  }

  if (emojis.length === 0) {
    delete records[dateKey];
  } else {
    records[dateKey] = emojis;
  }

  saveRecords();
  renderCalendar();
  // ポップアップを更新
  openPopup(selectedDate.year, selectedDate.month, selectedDate.day);
}

// すべての習慣をクリア
function clearAllHabits() {
  if (!selectedDate) return;

  const dateKey = getDateKey(selectedDate.year, selectedDate.month, selectedDate.day);
  delete records[dateKey];

  saveRecords();
  renderCalendar();
  closePopup();
}

// 習慣管理モーダルを開く
function openManageModal() {
  renderManageHabitList();
  document.getElementById('manage-modal-overlay').classList.add('active');
}

// 習慣管理モーダルを閉じる
function closeManageModal() {
  document.getElementById('manage-modal-overlay').classList.remove('active');
  // カレンダーを再描画（習慣が変更された場合に備えて）
  renderCalendar();
}

// 習慣管理リストを描画
function renderManageHabitList() {
  const listContainer = document.getElementById('manage-habit-list');
  listContainer.innerHTML = '';

  habits.forEach((habit, index) => {
    const item = document.createElement('div');
    item.classList.add('manage-habit-item');

    // 絵文字ボタン
    const emojiBtn = document.createElement('button');
    emojiBtn.classList.add('emoji-btn');
    if (habit.emoji) {
      emojiBtn.textContent = habit.emoji;
      emojiBtn.classList.add('has-emoji');
    } else {
      emojiBtn.textContent = '?';
    }
    emojiBtn.addEventListener('click', function() {
      openEmojiModal(index);
    });

    // ラベル入力
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.classList.add('label-input');
    labelInput.value = habit.label;
    labelInput.placeholder = '習慣の名前';
    labelInput.addEventListener('change', function() {
      habits[index].label = this.value;
      saveHabits();
    });

    // 削除ボタン
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', function() {
      tryDeleteHabit(index);
    });

    item.appendChild(emojiBtn);
    item.appendChild(labelInput);
    item.appendChild(deleteBtn);
    listContainer.appendChild(item);
  });
}

// 新しい習慣を追加
function addNewHabit() {
  habits.push({ emoji: '', label: '' });
  saveHabits();
  renderManageHabitList();
}

// 習慣の削除を試みる（確認が必要な場合はモーダルを表示）
function tryDeleteHabit(index) {
  const habit = habits[index];

  // 絵文字が空の場合は即削除
  if (!habit.emoji) {
    deleteHabit(index);
    return;
  }

  // この習慣の絵文字がrecordsに存在するかチェック
  const isUsed = isHabitUsed(habit.emoji);

  if (isUsed) {
    // 使用されている場合は確認モーダルを表示
    deleteTargetIndex = index;
    document.getElementById('confirm-message').textContent =
      `「${habit.label || habit.emoji}」は記録に使用されています。\n削除すると、カレンダー上の記録からもこの習慣が削除されます。\n本当に削除しますか？`;
    document.getElementById('confirm-modal-overlay').classList.add('active');
  } else {
    // 使用されていない場合は即削除
    deleteHabit(index);
  }
}

// 習慣が記録に使用されているかチェック
function isHabitUsed(emoji) {
  for (const dateKey in records) {
    const emojis = records[dateKey];
    if (Array.isArray(emojis) && emojis.includes(emoji)) {
      return true;
    }
  }
  return false;
}

// 確認モーダルを閉じる
function closeConfirmModal() {
  document.getElementById('confirm-modal-overlay').classList.remove('active');
  deleteTargetIndex = null;
}

// 削除を確認
function confirmDelete() {
  if (deleteTargetIndex !== null) {
    const habit = habits[deleteTargetIndex];

    // recordsからこの習慣の絵文字を削除
    for (const dateKey in records) {
      const emojis = records[dateKey];
      if (Array.isArray(emojis)) {
        const index = emojis.indexOf(habit.emoji);
        if (index > -1) {
          emojis.splice(index, 1);
          if (emojis.length === 0) {
            delete records[dateKey];
          }
        }
      }
    }
    saveRecords();

    // 習慣を削除
    deleteHabit(deleteTargetIndex);
  }
  closeConfirmModal();
}

// 習慣を削除
function deleteHabit(index) {
  habits.splice(index, 1);
  saveHabits();
  renderManageHabitList();
}

// 絵文字選択モーダルを開く
function openEmojiModal(index) {
  emojiTargetIndex = index;
  document.getElementById('emoji-modal-overlay').classList.add('active');
}

// 絵文字選択モーダルを閉じる
function closeEmojiModal() {
  document.getElementById('emoji-modal-overlay').classList.remove('active');
  emojiTargetIndex = null;
}

// 絵文字グリッドを初期化
function initEmojiGrid() {
  const grid = document.getElementById('emoji-grid');
  grid.innerHTML = '';

  availableEmojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.classList.add('emoji-option');
    btn.textContent = emoji;
    btn.addEventListener('click', function() {
      selectEmoji(emoji);
    });
    grid.appendChild(btn);
  });
}

// 絵文字を選択
function selectEmoji(emoji) {
  if (emojiTargetIndex !== null) {
    habits[emojiTargetIndex].emoji = emoji;
    saveHabits();
    renderManageHabitList();
  }
  closeEmojiModal();
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
