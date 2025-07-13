

// "use client"
import React, { useState, useMemo, useRef } from "react";
import { Table, Input, Space, Button, Row, Col, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;

export const handleSearch = (selectedKeys, confirm, dataIndex , setSearchText) => {
  confirm();
  // setSearchText(selectedKeys[0]);
};
export const getColumnSearchProps = (dataIndex, setSearchText) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder={`بحث `}
        value={selectedKeys[0]}
        onChange={(e) =>
          setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
        onPressEnter={() =>
          handleSearch(selectedKeys, confirm, dataIndex, setSearchText)
        }
        style={{ width: 188, marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() =>
            handleSearch(selectedKeys, confirm, dataIndex, setSearchText)
          }
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
          className="bg-primary text-white hover:!bg-black"
        >
          بحث
        </Button>
        <Button
          onClick={() => {
            setSelectedKeys([]);
            confirm();
          }}
          size="small"
          style={{ width: 90 }}
        >
          إعادة ضبط
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered) => (
    <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
  ),
  onFilter: (value, record) =>
    record[dataIndex]
      ?.toString()
      ?.toLowerCase()
      ?.includes(value.toLowerCase()),
});


export const getColumnNumberRange = (dataIndex) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
    <div className="" style={{ padding: 8 }}>
      <div className="flex gap-2">
        <Input
          placeholder="From"
          type="number"
          defaultValue={selectedKeys[0]?.min}
          onChange={(e) => {
            const min = e.target.value ? parseFloat(e.target.value) : undefined;
            const max = selectedKeys[0]?.max;
            setSelectedKeys(
              min !== undefined || max !== undefined ? [{ min, max }] : []
            );
          }}
          style={{ width: 80, marginBottom: 8, display: "block" }}
        />
        <Input
          placeholder="To"
          type="number"
          defaultValue={selectedKeys[0]?.max}
          onChange={(e) => {
            const min = selectedKeys[0]?.min;
            const max = e.target.value ? parseFloat(e.target.value) : undefined;
            setSelectedKeys(
              min !== undefined || max !== undefined ? [{ min, max }] : []
            );
          }}
          style={{ width: 80, marginBottom: 8, display: "block" }}
        />
      </div>
      <Space>
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<SearchOutlined />}
          size="small"
        >
          بحث
        </Button>
        <Button
          onClick={() => {
            setSelectedKeys([]);
            confirm();
          }}
          size="small"
        >
          إعادة ضبط
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered) => (
    <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
  ),
  onFilter: (value, record) => {
    const num = parseFloat(record[dataIndex]); // تحويل القيمة إلى رقم
    const min = value?.min ?? -Infinity;
    const max = value?.max ?? Infinity;
    console.log("value", value);
    console.log("record-price", num);
    console.log("record", record);
    return num >= min && num <= max;
  },
});

export const getColumnDateProps = (dataIndex) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div style={{ padding: 8 }}>
      <RangePicker
      lang="ar"
      placeholder={["من", "إلى"]}
        onChange={(dates, dateStrings) => {
          setSelectedKeys(
            dateStrings && dateStrings.length === 2 ? [dateStrings] : []
          );
          confirm();
        }}
      />
      <Button
        onClick={() => {
          clearFilters();
          confirm();
        }}
        size="small"
        style={{ width: 90, marginTop: 8 , marginRight: 10}}
      >
        إعادة ضبط
      </Button>
    </div>
  ),
  onFilter: (value, record) => {
    if (!value || value.length === 0) return true; // Show all if no filter
    const [startDate, endDate] = value; // Extract stored date range
    console.log("value", value);
    const recordDate = new Date(record[dataIndex]);
    console.log("recordDate", recordDate);
    return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
  },
});

export const getColumnFiltersProps = (dataIndex, filters) => ({
  filters: filters,
  onFilter: (value, record) => record[dataIndex] == value,
});

export const handleReset = (clearFilters) => {
  clearFilters();
  setSearchText("");
};

const DataTable = ({
  table,
  searchable = true,
  searchPlaceholder,
  onSearchChabnge,
  addBtn,
  onAddClick,
  btnText,
  ...rest
}) => {
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    return table && table?.rows
      ? table?.rows?.filter((item) =>
          Object.values(item).some((value) =>
            value?.toString()?.toLowerCase()?.includes(searchText?.toString().toLowerCase())
          )
        )
      : [];
  }, [searchText, table]);

  const onGlobalSearchChange = (e) => {
    onSearchChabnge ? onSearchChabnge(e) : null;
    setSearchText(e.target.value);
  };

  return (
    <div className="!w-full py-5">
      <div className=" flex  gap-3 justify-between">
        <div className="flex-1 ">
          <Input
            placeholder={searchPlaceholder ?? "Search Placeholder"}
            value={searchText}
            className="w-full"
            onChange={(e) => onGlobalSearchChange(e)}
            style={{ marginBottom: 16 }}
          />
        </div>
        {addBtn && (
          <div>
            <Button
              onClick={() => (onAddClick ? onAddClick() : null)}
              variant=""
              type="primary"
              className="bg-primary transition-all hover:!bg-black  text-white"
            >
              {btnText || "إضافة"}
            </Button>
          </div>
        )}
      </div>

      <Table
        
        direction="rtl"
        rowHoverable={false}
        scroll={{ x: "max-content" }} // Set a fixed height for the table body
        className="!w-full"
        columns={table?.header ?? []}
        dataSource={filteredData}
        pagination={{ pageSize: 20 }}
        // rowClassName={(record, index) =>
        //   "hover:bg-primary transition-all hover:text-white"
        // }
        {...rest  }
        
      />
    </div>
  );
};

export default DataTable;
