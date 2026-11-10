import { lecture01 } from "./lecture01.js";
import { lecture02 } from "./lecture02.js";
import { lecture03 } from "./lecture03.js";
import { lecture04 } from "./lecture04.js";
import { lecture05 } from "./lecture05.js";
import { lecture06 } from "./lecture06.js";
import { lecture07 } from "./lecture07.js";
import { lecture08 } from "./lecture08.js";

export const lectures = [
  lecture01,
  lecture02,
  lecture03,
  lecture04,
  lecture05,
  lecture06,
  lecture07,
  lecture08,
];

export const course = {
  code: "CS2030",
  name: "Database Systems",
  school: "Shaggar Institute of Technology",
  instructor: "Hana L. Goshu",
  examName: "Midterm I",
  examDate: "2026-11-11",
  examScope: "Lectures 1–8 (Weeks 1–4)",
};

// How many parts each lecture contributes to the wrap-up (summary + quiz)
export function lectureBySlug(slug) {
  return lectures.find((l) => l.slug === slug);
}
