import { useContext } from "react";

import ReadingListContext from "../context/ReadingListContext";

export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (!context) throw new Error("useReadingList must be used inside a ReadingListProvider.");
  return context;
}
