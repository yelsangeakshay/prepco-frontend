"use client";

import { useEffect, useState } from "react";

/** True only after `flag` has stayed true for `delayMs`; false again as soon as `flag` clears. */
export function useDelayedFlag(flag: boolean, delayMs = 150) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!flag) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(t);
  }, [flag, delayMs]);
  return flag && shown;
}
