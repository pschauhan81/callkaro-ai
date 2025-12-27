export const ACTIVE_STATUSES = [
  "initiated",
  "ringing",
  "in-progress",
];

export const FAILED_STATUSES = [
  "failed",
  "busy",
  "no-answer",
];

export const isActiveCall = (status?: string) => {
  return ACTIVE_STATUSES.includes(status ?? "");
};

export const isFailedCall = (status?: string) => {
  return FAILED_STATUSES.includes(status ?? "");
};





// import { isActiveCall } from "@/lib/callStatus";

// // example
// const activeCalls = calls.filter((c) => isActiveCall(c.status));
