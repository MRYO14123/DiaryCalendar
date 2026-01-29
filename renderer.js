// 現在表示している年月
let currentYear;
let currentMonth;

// 選択中の日付
let selectedDate = null;

// 絵文字選択対象のインデックスとタイプ
let emojiTargetIndex = null;
let emojiTargetType = null; // 'habits' or 'quickHabits'

// 削除確認対象のインデックス
let deleteTargetIndex = null;

// 1日に登録できる習慣の最大数
const MAX_HABITS_PER_DAY = 4;

// カテゴリ別絵文字リスト
const emojiCategories = {
  activity: {
    name: '運動',
    emojis: ['🏃', '💪', '🚶', '🚴', '🏊', '⚽', '🎾', '🏀', '⚾', '🏐', '🏈', '🎳', '🏋️', '🤸', '🧘', '🧗', '🤾', '🏌️', '🏇', '⛷️', '🏂', '🛹', '🛼', '🚣']
  },
  study: {
    name: '学習',
    emojis: ['📚', '✍️', '📝', '📖', '✏️', '💡', '🎓', '📐', '📏', '🔬', '🔭', '💻', '⌨️', '🖥️', '📊', '📈', '🧮', '📓', '📔', '📒', '🗂️', '📑', '🗒️', '✒️']
  },
  life: {
    name: '生活',
    emojis: ['🍳', '🧹', '💤', '💊', '🚰', '🥗', '🍽️', '🛁', '🚿', '🪥', '💇', '👔', '👕', '🧺', '🛒', '💰', '🏠', '🛏️', '⏰', '📱', '🚗', '🚌', '✈️', '🛫']
  },
  hobby: {
    name: '趣味',
    emojis: ['🎨', '🎵', '🎮', '🎯', '🎬', '🎭', '🎪', '🎸', '🎹', '🎺', '🎻', '🎲', '🃏', '🎰', '🎧', '📷', '📸', '🎥', '📹', '🖼️', '🎁', '🧩', '♟️', '🎤']
  },
  other: {
    name: 'その他',
    emojis: ['🌱', '🌸', '⭐', '❤️', '💖', '💝', '🎉', '🎊', '✨', '🔥', '💯', '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '👍', '👏', '🙏', '💪', '🤝', '✅', '☑️']
  }
};

// 選択可能な絵文字リスト（後方互換性のため）
const availableEmojis = Object.values(emojiCategories).flatMap(cat => cat.emojis);

// 現在選択中のカテゴリ
let currentEmojiCategory = 'activity';

// カスタム画像リスト
let customImages = [];

// デフォルトの習慣リスト
const defaultHabits = [
  { emoji: '📚', label: '読書' },
  { emoji: '🏃', label: '運動' },
  { emoji: '✍️', label: '勉強' },
  { emoji: '🧘', label: '瞑想' },
  { emoji: '💪', label: '筋トレ' },
  { emoji: '🎨', label: '創作活動' }
];

// デフォルトのクイック習慣
const defaultQuickHabits = [
  { emoji: '📚', label: '読書' },
  { emoji: '🏃', label: '運動' },
  { emoji: '✍️', label: '勉強' },
  { emoji: '💪', label: '筋トレ' }
];

// 習慣リスト（絵文字とラベル）
let habits = [];

// クイック習慣リスト（4つ固定）
let quickHabits = [];

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
  renderQuickButtons();

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

  // クイック習慣設定モーダルのイベントリスナー
  document.getElementById('quick-habits-btn').addEventListener('click', openQuickHabitsModal);
  document.getElementById('quick-habits-modal-close').addEventListener('click', closeQuickHabitsModal);
  document.getElementById('quick-habits-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeQuickHabitsModal();
  });

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

  // クイックボタンのイベントリスナー
  for (let i = 0; i < 4; i++) {
    document.getElementById(`quick-btn-${i}`).addEventListener('click', function() {
      quickRegister(i);
    });
  }

  // 絵文字カテゴリタブのイベントリスナー
  document.querySelectorAll('.emoji-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const category = this.dataset.category;
      switchEmojiCategory(category);
    });
  });

  // 画像アップロードのイベントリスナー
  document.getElementById('upload-image-btn').addEventListener('click', function() {
    document.getElementById('image-upload').click();
  });
  document.getElementById('image-upload').addEventListener('change', handleImageUpload);

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

  // クイック習慣を読み込み
  const savedQuickHabits = localStorage.getItem('diary-calendar-quick-habits');
  if (savedQuickHabits) {
    quickHabits = JSON.parse(savedQuickHabits);
  } else {
    quickHabits = [...defaultQuickHabits];
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

  // カスタム画像を読み込み
  const savedCustomImages = localStorage.getItem('diary-calendar-custom-images');
  if (savedCustomImages) {
    customImages = JSON.parse(savedCustomImages);
  }
}

// 習慣リストを保存
function saveHabits() {
  localStorage.setItem('diary-calendar-habits', JSON.stringify(habits));
}

// クイック習慣を保存
function saveQuickHabits() {
  localStorage.setItem('diary-calendar-quick-habits', JSON.stringify(quickHabits));
}

// 記録を保存
function saveRecords() {
  localStorage.setItem('diary-calendar-records', JSON.stringify(records));
}

// カスタム画像を保存
function saveCustomImages() {
  localStorage.setItem('diary-calendar-custom-images', JSON.stringify(customImages));
}

// 日付キーを生成（YYYY-MM-DD形式）
function getDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// 絵文字またはカスタム画像をレンダリング
function renderEmojiContent(emojiData, container) {
  container.innerHTML = '';
  if (!emojiData) return;

  if (emojiData.startsWith('custom:')) {
    const index = parseInt(emojiData.split(':')[1]);
    if (customImages[index]) {
      const img = document.createElement('img');
      img.src = customImages[index];
      img.alt = 'カスタム画像';
      container.appendChild(img);
    }
  } else {
    container.textContent = emojiData;
  }
}

// 今日の日付キーを取得
function getTodayKey() {
  const today = new Date();
  return getDateKey(today.getFullYear(), today.getMonth(), today.getDate());
}

// クイックボタンを描画
function renderQuickButtons() {
  const todayKey = getTodayKey();
  const todayEmojis = records[todayKey] || [];

  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`quick-btn-${i}`);
    const emojiSpan = btn.querySelector('.quick-btn-emoji');
    const habit = quickHabits[i];

    if (habit && habit.emoji) {
      renderEmojiContent(habit.emoji, emojiSpan);
      btn.classList.remove('empty');

      // 今日既に登録されているかチェック
      if (todayEmojis.includes(habit.emoji)) {
        btn.classList.add('registered');
      } else {
        btn.classList.remove('registered');
      }
    } else {
      emojiSpan.textContent = '';
      btn.classList.add('empty');
      btn.classList.remove('registered');
    }
  }
}

// クイック登録（ボタンクリック時）
function quickRegister(index) {
  const habit = quickHabits[index];
  if (!habit || !habit.emoji) return;

  const todayKey = getTodayKey();
  let emojis = records[todayKey] || [];

  const emojiIndex = emojis.indexOf(habit.emoji);
  if (emojiIndex > -1) {
    // 既に登録されている場合は削除（トグル）
    emojis.splice(emojiIndex, 1);
  } else {
    // 上限チェック
    if (emojis.length >= MAX_HABITS_PER_DAY) {
      return;
    }
    emojis.push(habit.emoji);
  }

  if (emojis.length === 0) {
    delete records[todayKey];
  } else {
    records[todayKey] = emojis;
  }

  saveRecords();
  renderCalendar();
  renderQuickButtons();
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
      renderEmojiContent(emojis[i], emojiSpan);
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

    const emojiSpan = document.createElement('span');
    emojiSpan.classList.add('emoji');
    renderEmojiContent(habit.emoji, emojiSpan);

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('label');
    labelSpan.textContent = habit.label;

    item.appendChild(emojiSpan);
    item.appendChild(labelSpan);
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
  renderQuickButtons();
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
  renderQuickButtons();
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
      renderEmojiContent(habit.emoji, emojiBtn);
      emojiBtn.classList.add('has-emoji');
      if (habit.emoji.startsWith('custom:')) {
        emojiBtn.classList.add('has-image');
      }
    } else {
      emojiBtn.textContent = '?';
    }
    emojiBtn.addEventListener('click', function() {
      openEmojiModal(index, 'habits');
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

// クイック習慣設定モーダルを開く
function openQuickHabitsModal() {
  renderQuickHabitList();
  document.getElementById('quick-habits-modal-overlay').classList.add('active');
}

// クイック習慣設定モーダルを閉じる
function closeQuickHabitsModal() {
  document.getElementById('quick-habits-modal-overlay').classList.remove('active');
  renderQuickButtons();
}

// クイック習慣リストを描画
function renderQuickHabitList() {
  const listContainer = document.getElementById('quick-habit-list');
  listContainer.innerHTML = '';

  for (let i = 0; i < 4; i++) {
    const habit = quickHabits[i] || { emoji: '', label: '' };

    const item = document.createElement('div');
    item.classList.add('manage-habit-item');

    // ボタン番号表示
    const numLabel = document.createElement('span');
    numLabel.style.cssText = 'font-weight: bold; color: #666; min-width: 24px;';
    numLabel.textContent = `${i + 1}.`;

    // 絵文字ボタン
    const emojiBtn = document.createElement('button');
    emojiBtn.classList.add('emoji-btn');
    if (habit.emoji) {
      renderEmojiContent(habit.emoji, emojiBtn);
      emojiBtn.classList.add('has-emoji');
      if (habit.emoji.startsWith('custom:')) {
        emojiBtn.classList.add('has-image');
      }
    } else {
      emojiBtn.textContent = '?';
    }
    emojiBtn.addEventListener('click', function() {
      openEmojiModal(i, 'quickHabits');
    });

    // ラベル入力
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.classList.add('label-input');
    labelInput.value = habit.label;
    labelInput.placeholder = '習慣の名前';
    labelInput.addEventListener('change', function() {
      quickHabits[i].label = this.value;
      saveQuickHabits();
    });

    item.appendChild(numLabel);
    item.appendChild(emojiBtn);
    item.appendChild(labelInput);
    listContainer.appendChild(item);
  }
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
function openEmojiModal(index, type) {
  emojiTargetIndex = index;
  emojiTargetType = type;
  // カテゴリをリセットして絵文字グリッドを再描画
  switchEmojiCategory('activity');
  document.getElementById('emoji-modal-overlay').classList.add('active');
}

// 絵文字選択モーダルを閉じる
function closeEmojiModal() {
  document.getElementById('emoji-modal-overlay').classList.remove('active');
  emojiTargetIndex = null;
  emojiTargetType = null;
}

// 絵文字カテゴリを切り替え
function switchEmojiCategory(category) {
  currentEmojiCategory = category;

  // タブのアクティブ状態を更新
  document.querySelectorAll('.emoji-tab').forEach(tab => {
    if (tab.dataset.category === category) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // カスタムセクションの表示切り替え
  const customSection = document.getElementById('custom-image-section');
  if (category === 'custom') {
    customSection.style.display = 'block';
  } else {
    customSection.style.display = 'none';
  }

  // 絵文字グリッドを更新
  renderEmojiGrid();
}

// 絵文字グリッドを描画
function renderEmojiGrid() {
  const grid = document.getElementById('emoji-grid');
  grid.innerHTML = '';

  if (currentEmojiCategory === 'custom') {
    // カスタム画像を表示
    if (customImages.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.style.cssText = 'text-align: center; color: #999; padding: 20px; grid-column: 1 / -1;';
      emptyMsg.textContent = 'アップロードした画像がありません';
      grid.appendChild(emptyMsg);
    } else {
      customImages.forEach((imgData, index) => {
        const container = document.createElement('div');
        container.classList.add('custom-image-item');

        const btn = document.createElement('button');
        btn.classList.add('emoji-option', 'custom-image');
        const img = document.createElement('img');
        img.src = imgData;
        btn.appendChild(img);
        btn.addEventListener('click', function() {
          selectEmoji(`custom:${index}`);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('custom-image-delete');
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          deleteCustomImage(index);
        });

        container.appendChild(btn);
        container.appendChild(deleteBtn);
        grid.appendChild(container);
      });
    }
  } else {
    // 通常の絵文字を表示
    const emojis = emojiCategories[currentEmojiCategory]?.emojis || [];
    emojis.forEach(emoji => {
      const btn = document.createElement('button');
      btn.classList.add('emoji-option');
      btn.textContent = emoji;
      btn.addEventListener('click', function() {
        selectEmoji(emoji);
      });
      grid.appendChild(btn);
    });
  }
}

// 絵文字グリッドを初期化
function initEmojiGrid() {
  currentEmojiCategory = 'activity';
  renderEmojiGrid();
}

// 画像アップロード処理
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // ファイルサイズチェック（2MB以下）
  if (file.size > 2 * 1024 * 1024) {
    alert('画像サイズは2MB以下にしてください');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    // 画像を正方形にリサイズ
    resizeImage(e.target.result, 64, function(resizedDataUrl) {
      customImages.push(resizedDataUrl);
      saveCustomImages();
      renderEmojiGrid();
    });
  };
  reader.readAsDataURL(file);

  // inputをリセット（同じファイルを再選択可能にする）
  event.target.value = '';
}

// 画像をリサイズ（正方形に切り取り）
function resizeImage(dataUrl, size, callback) {
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 正方形に切り取り（中央基準）
    const minSide = Math.min(img.width, img.height);
    const sx = (img.width - minSide) / 2;
    const sy = (img.height - minSide) / 2;

    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
    callback(canvas.toDataURL('image/png'));
  };
  img.src = dataUrl;
}

// カスタム画像を削除
function deleteCustomImage(index) {
  const imgData = `custom:${index}`;

  // この画像が使用されているかチェック
  let isUsed = false;
  for (const dateKey in records) {
    if (records[dateKey].some(e => e === imgData)) {
      isUsed = true;
      break;
    }
  }

  if (isUsed) {
    if (!confirm('この画像は記録で使用されています。削除すると記録からも削除されます。よろしいですか？')) {
      return;
    }
    // recordsから削除
    for (const dateKey in records) {
      records[dateKey] = records[dateKey].filter(e => e !== imgData);
      if (records[dateKey].length === 0) {
        delete records[dateKey];
      }
    }
    saveRecords();
  }

  // 習慣とクイック習慣からも削除
  habits.forEach(h => {
    if (h.emoji === imgData) h.emoji = '';
  });
  quickHabits.forEach(h => {
    if (h.emoji === imgData) h.emoji = '';
  });
  saveHabits();
  saveQuickHabits();

  // インデックスを更新（削除後のインデックスずれを修正）
  const oldIndex = index;
  customImages.splice(index, 1);
  saveCustomImages();

  // 全ての参照を更新
  updateCustomImageReferences(oldIndex);

  renderEmojiGrid();
  renderCalendar();
  renderQuickButtons();
}

// カスタム画像の参照を更新（削除時のインデックスずれ修正）
function updateCustomImageReferences(deletedIndex) {
  // records内の参照を更新
  for (const dateKey in records) {
    records[dateKey] = records[dateKey].map(e => {
      if (e.startsWith('custom:')) {
        const idx = parseInt(e.split(':')[1]);
        if (idx > deletedIndex) {
          return `custom:${idx - 1}`;
        }
      }
      return e;
    });
  }
  saveRecords();

  // habits内の参照を更新
  habits.forEach(h => {
    if (h.emoji && h.emoji.startsWith('custom:')) {
      const idx = parseInt(h.emoji.split(':')[1]);
      if (idx > deletedIndex) {
        h.emoji = `custom:${idx - 1}`;
      }
    }
  });
  saveHabits();

  // quickHabits内の参照を更新
  quickHabits.forEach(h => {
    if (h.emoji && h.emoji.startsWith('custom:')) {
      const idx = parseInt(h.emoji.split(':')[1]);
      if (idx > deletedIndex) {
        h.emoji = `custom:${idx - 1}`;
      }
    }
  });
  saveQuickHabits();
}

// 絵文字を選択
function selectEmoji(emoji) {
  if (emojiTargetIndex !== null && emojiTargetType !== null) {
    if (emojiTargetType === 'habits') {
      habits[emojiTargetIndex].emoji = emoji;
      saveHabits();
      renderManageHabitList();
    } else if (emojiTargetType === 'quickHabits') {
      if (!quickHabits[emojiTargetIndex]) {
        quickHabits[emojiTargetIndex] = { emoji: '', label: '' };
      }
      quickHabits[emojiTargetIndex].emoji = emoji;
      saveQuickHabits();
      renderQuickHabitList();
    }
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
