import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { base_url } from "../utils/base_url";

const ReadStatusContext = createContext(null);

export const ReadStatusProvider = ({ children }) => {
  const [readFlags, setReadFlags] = useState({
    tour: 1,
    car: 1,
    hotel: 1,
    activity: 1,
  });

  const fetchReadFlags = useCallback(async () => {
    try {
      const res = await axios.get(`${base_url}/admin/read/select_read.php`);
      if (res.data?.status === "success") {
        setReadFlags(
          res.data.message || {
            tour: 1,
            car: 1,
            hotel: 1,
            activity: 1,
          }
        );
      }
    } catch (err) {
      console.error("Error fetching read flags:", err);
    }
  }, []);

  useEffect(() => {
    fetchReadFlags();
  }, [fetchReadFlags]);

  // ✅ 0 = فيه جديد
  const hasNewByType = useCallback(
    (type) => String(readFlags?.[type]) === "0",
    [readFlags]
  );

  const hasAnyNew = useMemo(() => {
    return ["tour", "car", "hotel", "activity"].some(
      (type) => String(readFlags?.[type]) === "0"
    );
  }, [readFlags]);

  const value = useMemo(
    () => ({
      readFlags,
      fetchReadFlags,
      hasNewByType,
      hasAnyNew,
    }),
    [readFlags, fetchReadFlags, hasNewByType, hasAnyNew]
  );

  return (
    <ReadStatusContext.Provider value={value}>
      {children}
    </ReadStatusContext.Provider>
  );
};

export const useReadStatus = () => {
  const context = useContext(ReadStatusContext);
  if (!context) {
    throw new Error("useReadStatus must be used within ReadStatusProvider");
  }
  return context;
};
