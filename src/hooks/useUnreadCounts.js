// hooks/useUnreadCounts.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { base_url } from "../utils/base_url";

const useUnreadCounts = (intervalMs = 30000) => {
  const [counts, setCounts] = useState({
    tour: 0,
    car: 0,
    hotel: 0,
    activity: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await axios.get(`${base_url}/admin/read/select_read.php`);
      if (res.data.status === "success") {
        setCounts(res.data.message);
      }
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const timer = setInterval(fetchCounts, intervalMs);
    return () => clearInterval(timer);
  }, [fetchCounts, intervalMs]);

  const total =
    Number(counts.tour) +
    Number(counts.car) +
    Number(counts.hotel) +
    Number(counts.activity);

  return { counts, total, refetch: fetchCounts };
};

export default useUnreadCounts;
