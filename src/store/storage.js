const KEYS = {
  students: 'educate_students',
  homework: 'educate_homework',
  workbooks: 'educate_workbooks',
  tests: 'educate_tests',
  sessions: 'educate_sessions',
};

export function load(key) {
  try {
    const data = localStorage.getItem(KEYS[key]);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function save(key, data) {
  localStorage.setItem(KEYS[key], JSON.stringify(data));
}
