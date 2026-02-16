// hooks/useTabPagination.js
import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

const useTabPagination = (prefix, defaultPageSize = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get(`${prefix}-page`) || "1", 10);
  const currentPageSize = parseInt(
    searchParams.get(`${prefix}-limit`) || String(defaultPageSize),
    10
  );
  const currentStatus = searchParams.get(`${prefix}-status`) || "all";
  const currentManual = searchParams.get(`${prefix}-manual`) || "all";
  const currentSearch = searchParams.get(`${prefix}-search`) || "";

  const updateParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        const paramKey = `${prefix}-${key}`;
        if (value === null || value === undefined || value === "") {
          newParams.delete(paramKey);
        } else {
          newParams.set(paramKey, String(value));
        }
      });

      setSearchParams(newParams, { replace: true });
    },
    [prefix, searchParams, setSearchParams]
  );

  const setPage = useCallback(
    (page, pageSize) => {
      updateParams({ page, limit: pageSize });
    },
    [updateParams]
  );

  const setStatus = useCallback(
    (status) => {
      updateParams({ status: status === "all" ? null : status, page: 1 });
    },
    [updateParams]
  );

  const setManual = useCallback(
    (manual) => {
      updateParams({ manual: manual === "all" ? null : manual, page: 1 });
    },
    [updateParams]
  );

  const setSearch = useCallback(
    (search) => {
      updateParams({ search: search || null, page: 1 });
    },
    [updateParams]
  );

  return {
    currentPage,
    currentPageSize,
    currentStatus,
    currentManual,
    currentSearch,
    setPage,
    setStatus,
    setManual,
    setSearch,
    updateParams,
  };
};

export default useTabPagination;
