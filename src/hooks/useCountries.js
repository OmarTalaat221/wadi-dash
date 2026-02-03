import { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { base_url } from "../utils/base_url";

const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCountries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${base_url}/user/countries/select_countries.php`
      );

      if (response.data.status === "success") {
        setCountries(response.data.message || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch countries");
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
      setError(err.message);
      message.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return { countries, loading, error, refetch: fetchCountries };
};

export default useCountries;
