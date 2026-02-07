// utils/dateTime.js
// Complete code:
// ✅ dateFormat support: "DD MMM YYYY" (default), "DD MMM", "DD.MM.YYYY", "MM/DD/YY", "DD/MM/YYYY", "MM/DD/YYYY"
// ✅ timeFormat support: "12" => "09:45 PM", "24" => "21:45"
// ✅ safe parsing for "YYYY-MM-DD" keys (local date, no timezone shift)
// ✅ controls: only time / only day / only date / day+date / date+time / day+date+time

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

const pad2 = (n) => (Number(n) < 10 ? `0${n}` : `${n}`);

/**
 * Safe date parser
 * - Date object
 * - timestamp / ISO string
 * - "YYYY-MM-DD" (forced LOCAL date, prevents UTC shift)
 */
const toDate = (input) => {
  if (!input) return null;

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === "string") {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      const local = new Date(y, mo, d);
      return isNaN(local.getTime()) ? null : local;
    }
  }

  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
};

const resolveDateFormat = (settingsOrFormat) => {
  if (!settingsOrFormat) return "DD MMM YYYY";
  if (typeof settingsOrFormat === "string") return settingsOrFormat;
  return settingsOrFormat?.dateFormat || "DD MMM YYYY";
};

// settingsOrFormat can be settings object with timeFormat OR plain dateFormat string
const resolveTimeFormat = (settingsOrFormat, overrideTimeFormat) => {
  if (overrideTimeFormat) return overrideTimeFormat; // "12" | "24"
  if (!settingsOrFormat) return "12";
  if (typeof settingsOrFormat === "string") return "12";
  return settingsOrFormat?.timeFormat || "12";
};

/* =========================
   DATE ONLY
========================= */
export function formatDateBySettings(input, settingsOrFormat, showDay = false) {
  const d = toDate(input);
  if (!d) return "";

  const format = resolveDateFormat(settingsOrFormat);

  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const mmm = MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();
  const yy = String(yyyy).slice(-2);
  const day = DAYS[d.getDay()];

  let datePart = "";

  switch (format) {
    case "DD MMM":
      datePart = `${dd} ${mmm}`;
      break;

    case "DD.MM.YYYY":
      datePart = `${dd}.${mm}.${yyyy}`;
      break;

    case "MM/DD/YY":
      datePart = `${mm}/${dd}/${yy}`;
      break;

    case "DD/MM/YYYY":
      datePart = `${dd}/${mm}/${yyyy}`;
      break;

    case "MM/DD/YYYY":
      datePart = `${mm}/${dd}/${yyyy}`;
      break;

    case "DD MMM YYYY":
    default:
      datePart = `${dd} ${mmm} ${yyyy}`;
  }

  return showDay ? `${day}, ${datePart}` : datePart;
}

/* =========================
   TIME ONLY (12h / 24h)
========================= */
export function formatTimeBySettings(input, settingsOrFormat, timeFormatOverride) {
  const d = toDate(input);
  if (!d) return "";

  const timeFormat = resolveTimeFormat(settingsOrFormat, timeFormatOverride);
  const minutes = pad2(d.getMinutes());

  // ✅ 24-hour time
  if (timeFormat === "24") {
    return `${pad2(d.getHours())}:${minutes}`;
  }

  // ✅ 12-hour time (default)
  let hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${pad2(hours)}:${minutes} ${ampm}`;
}

/* =========================
   DAY ONLY (TUE)
========================= */
export function formatDayOnly(input) {
  const d = toDate(input);
  if (!d) return "";
  return DAYS[d.getDay()];
}

/* =========================
   DATE + TIME
========================= */
export function formatDateTimeBySettings(
  input,
  settingsOrFormat,
  showDay = false,
  timeFirst = false,
  timeFormatOverride // optional "12" | "24"
) {
  const date = formatDateBySettings(input, settingsOrFormat, showDay);
  const time = formatTimeBySettings(input, settingsOrFormat, timeFormatOverride);

  if (!date && !time) return "";
  if (!date) return time;
  if (!time) return date;

  return timeFirst ? `${time} ${date}` : `${date} ${time}`;
}

/* =========================
   ONE FUNCTION — FULL CONTROL
========================= */
/**
 * formatByFlags(
 *   input,
 *   settingsOrFormat,
 *   showDate,
 *   showDay,
 *   showTime,
 *   timeFirst,
 *   dayOnly,
 *   timeFormatOverride
 * )
 *
 * Examples:
 * - Only time (12h): formatByFlags(ts, settings, false,false,true)
 * - Only time (24h): formatByFlags(ts, settings, false,false,true,false,false,"24")
 * - Only day:        formatByFlags(ts, settings, false,false,false,false,true)
 * - Only date:       formatByFlags(ts, settings, true,false,false)
 * - Day+date:        formatByFlags(ts, settings, true,true,false)
 * - Full:            formatByFlags(ts, settings, true,true,true)
 */
export function dateFormatByFlags(
  input,
  settingsOrFormat,
  showDate = true,
  showDay = false,
  showTime = false,
  timeFirst = false,
  dayOnly = false,
  timeFormatOverride // "12" | "24"
) {
  // ✅ only day
  if (dayOnly) {
    return formatDayOnly(input);
  }

  // ✅ only time
  if (!showDate && showTime) {
    return formatTimeBySettings(input, settingsOrFormat, timeFormatOverride);
  }

  // ✅ only date
  if (showDate && !showTime) {
    return formatDateBySettings(input, settingsOrFormat, showDay);
  }

  // ✅ date + time
  if (showDate && showTime) {
    return formatDateTimeBySettings(
      input,
      settingsOrFormat,
      showDay,
      timeFirst,
      timeFormatOverride
    );
  }

  // ✅ nothing
  return "";
}
