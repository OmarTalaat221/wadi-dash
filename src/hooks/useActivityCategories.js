// hooks/useActivityCategories.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { message } from "antd";
import { base_url } from "../utils/base_url";

const useActivityCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/activities/select_activity_categories.php`
      );
      if (response.data?.status === "success") {
        setCategories(response.data.message || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching activity categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Only visible categories
  const visibleCategories = categories.filter(
    (cat) => cat.hidden === "0" || cat.hidden === 0
  );

  return {
    categories,
    visibleCategories,
    loading,
    refetch: fetchCategories,
  };
};

export default useActivityCategories;
