import { useEffect, useState } from "react";

export function useClock() {
  const [value, setValue] = useState("--:--");
  useEffect(() => {
    const update = () =>
      setValue(
        new Intl.DateTimeFormat("ja-JP", {
          timeZone: "Asia/Tokyo",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);
  return value;
}
