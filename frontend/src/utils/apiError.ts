import axios from "axios";

export function messageFromUnknown(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const m = (data as { message?: unknown }).message;
      if (typeof m === "string" && m) return m;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function axiosResponseStatus(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}

/** Response body `message` when present (for status checks without a fallback string). */
export function axiosResponseDataMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return "";
  const data = err.response?.data;
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message?: unknown }).message;
    return typeof m === "string" ? m : "";
  }
  return "";
}

/** Name from DOMException / Error-like objects */
export function errorName(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "name" in err) {
    const n = (err as { name: unknown }).name;
    return typeof n === "string" ? n : undefined;
  }
  return undefined;
}

export function signinErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === "object") {
      const d = data as { message?: unknown; error?: unknown };
      if (typeof d.message === "string" && d.message) return d.message;
      if (typeof d.error === "string" && d.error) return d.error;
    }
  }
  return messageFromUnknown(err, "Signin failed");
}

export function signupRequestErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === "object") {
      const errObj = data as {
        errors?: { fieldErrors?: Record<string, string[] | undefined> };
        message?: unknown;
      };
      const fieldErrors = errObj.errors?.fieldErrors;
      if (fieldErrors && typeof fieldErrors === "object") {
        const parts: string[] = [];
        const add = (label: string, key: string) => {
          const arr = fieldErrors[key];
          if (Array.isArray(arr) && arr.length)
            parts.push(`${label}: ${arr.join(" ")}`);
        };
        add("Name", "name");
        add("Email", "email");
        add("Company", "company");
        add("Message", "message");
        if (parts.length) return parts.join("\n");
      }
      if (typeof errObj.message === "string" && errObj.message)
        return errObj.message;
    }
  }
  return messageFromUnknown(err, "Failed to send");
}

/** Message from DOMException / Error-like objects */
export function errorMessage(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message: unknown }).message;
    return typeof m === "string" ? m : undefined;
  }
  return undefined;
}
