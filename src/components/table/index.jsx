import React, { useMemo, useState } from "react";

function Table({ title, body, headers, pages, setPages, extraColumns = [] }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchFilters, setSearchFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const [localPages, setLocalPages] = useState({ page: 1, perPage: 5 });

  const safePages = pages || localPages;
  const safeSetPages = setPages || setLocalPages;

  const handleSearchChange = (dataIndex, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [dataIndex]: value,
    }));
    safeSetPages({ ...safePages, page: 1 });
  };

  const handleSort = (dataIndex) => {
    setSortConfig((prev) => {
      if (prev.key === dataIndex) {
        return {
          key: dataIndex,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: dataIndex, direction: "asc" };
    });
    safeSetPages({ ...safePages, page: 1 });
  };

  const detectType = (value) => {
    if (!isNaN(Date.parse(value))) return "date";
    if (!isNaN(Number(value))) return "number";
    return "string";
  };

  const compareValues = (a, b, type) => {
    if (type === "number") return Number(a || 0) - Number(b || 0);
    if (type === "date") {
      const dateA = a ? new Date(a).getTime() : 0;
      const dateB = b ? new Date(b).getTime() : 0;
      return dateA - dateB;
    }
    return a
      ?.toString()
      .localeCompare(b?.toString() || "", undefined, { sensitivity: "base" });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = body && body?.length ? [...body] : [];

    if (globalSearch) {
      const lowerSearch = globalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        headers.some(
          (header) =>
            header.search &&
            row[header.dataIndex]
              ?.toString()
              .toLowerCase()
              .includes(lowerSearch)
        )
      );
    }

    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          row[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    if (sortConfig.key && filtered.length > 0) {
      const type = detectType(filtered[0]?.[sortConfig.key]);
      filtered.sort((a, b) => {
        const result = compareValues(
          a[sortConfig.key],
          b[sortConfig.key],
          type
        );
        return sortConfig.direction === "asc" ? result : -result;
      });
    }

    return filtered;
  }, [body, globalSearch, searchFilters, sortConfig, headers]);

  const paginatedData = useMemo(() => {
    const start = (safePages.page - 1) * safePages.perPage;
    const end = start + safePages.perPage;
    return filteredAndSortedData.slice(start, end);
  }, [filteredAndSortedData, safePages]);

  const totalPages = Math.ceil(
    filteredAndSortedData.length / safePages.perPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      safeSetPages({ ...safePages, page: newPage });
    }
  };

  const handlePerPageChange = (e) => {
    safeSetPages({ page: 1, perPage: Number(e.target.value) });
  };

  return (
    <div className="overflow-hidden flex flex-col">
      <div
        className="flex align-center justify-between"
        style={{ marginBottom: "1rem" }}
      >
        <h1 className="text-[24px]">{title}</h1>
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            className="global-search pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2  focus:border-[#295557]"
            placeholder="Search"
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              safeSetPages({ ...safePages, page: 1 });
            }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 18a8 8 0 111.89-15.688A7.963 7.963 0 0110 2c3.314 0 6 2.686 6 6s-2.686 6-6 6zm0 0l6 6"
            />
          </svg>
        </div>
      </div>
      <div className="table-component overflow-x-auto max-w-[100%]">
        <table>
          <thead>
            <tr>
              {headers?.map((item, index) => (
                <th key={index}>
                  <span onClick={() => item.sort && handleSort(item.dataIndex)}>
                    {item.label}
                  </span>
                  {item.sort && (
                    <span>
                      {sortConfig.key === item.dataIndex
                        ? sortConfig.direction === "asc"
                          ? " 🔼"
                          : " 🔽"
                        : " ⏺️"}
                    </span>
                  )}
                  {item.search && (
                    <div className="relative w-full max-w-xs">
                      <input
                        type="text"
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2  focus:border-[#295557]  min-w-[200px]"
                        placeholder={`Search ${item.label}`}
                        value={searchFilters[item.dataIndex] || ""}
                        onChange={(e) =>
                          handleSearchChange(item.dataIndex, e.target.value)
                        }
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 18a8 8 0 111.89-15.688A7.963 7.963 0 0110 2c3.314 0 6 2.686 6 6s-2.686 6-6 6zm0 0l6 6"
                        />
                      </svg>
                    </div>
                  )}
                </th>
              ))}
              {extraColumns?.map((item, index) => (
                <th key={`extra-${index}`}>
                  <span>{item.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map((item, index) => (
              <tr key={index}>
                {headers?.map((header_item, header_index) =>
                  header_item?.render ? (
                    <td key={`header-${header_index}`}>
                      {header_item.render({
                        row: item,
                        header_index,
                        body_index: index,
                        header_item,
                      })}
                    </td>
                  ) : (
                    <td key={`header-${header_index}`}>
                      {item[header_item.dataIndex]}
                    </td>
                  )
                )}
                {extraColumns?.map((extra_item, extra_index) => (
                  <td key={`extra-${extra_index}`}>
                    {extra_item.render({
                      row: item,
                      header_index: headers.length + extra_index,
                      body_index: index,
                      header_item: extra_item,
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <button
            onClick={() => handlePageChange(safePages.page - 1)}
            disabled={safePages.page <= 1}
          >
            Prev
          </button>
          <span style={{ margin: "0 1rem" }}>
            Page {safePages.page} of {totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(safePages.page + 1)}
            disabled={safePages.page >= totalPages}
          >
            Next
          </button>
        </div>
        <div>
          <label>Per Page: </label>
          <select value={safePages.perPage} onChange={handlePerPageChange}>
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default Table;
