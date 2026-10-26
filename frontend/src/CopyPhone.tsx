import { useState } from "react";
import { copyText, phoneRaw } from "./api";

export default function CopyPhone({ phone }: { phone?: string }) {
  const [done, setDone] = useState(false);
  if (!phone) return null;
  return (
    <button type="button" className="copy" aria-label="Скопіювати номер"
      onClick={async (e) => {
        e.stopPropagation();
        if (await copyText(phoneRaw(phone))) {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}>
      {done ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
    </button>
  );
}
