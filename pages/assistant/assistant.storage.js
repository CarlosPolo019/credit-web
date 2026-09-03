const LESSON_BEATS_KEY = "credit-web-lesson-beats";

export function readLessonBeatsSeen() {
  try {
    return window.localStorage.getItem(LESSON_BEATS_KEY) === "1";
  } catch {
    return false;
  }
}

export function markLessonBeatsSeen() {
  try {
    window.localStorage.setItem(LESSON_BEATS_KEY, "1");
  } catch {
    // Storage can be unavailable in private mode; the dock still hushes in memory.
  }
}
