export type AllowedStatus =
  | "init"
  | "error"
  | "started"
  | "building"
  | "cleaning"
  | "done";

export interface BibleStatuses {
  [s: string]: AllowedStatus;
}

export interface AjaxReply {
  status: AllowedStatus;
  url?: string;
  error?: string;
  name?: string;
}
