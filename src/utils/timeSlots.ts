// src/utils/timeSlots.ts
export const TIME_SLOTS = [
  "5:00 AM - 6:00 AM",
  "6:00 AM - 7:00 AM",
  "7:00 AM - 8:00 AM",
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
];

export function parseTimeString(timeStr: string) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

export function isSlotExpired(slot: string) {
  const [start] = slot.split(" - ");
  const slotStartDate = parseTimeString(start);
  const now = new Date();
  return now >= slotStartDate;
}
