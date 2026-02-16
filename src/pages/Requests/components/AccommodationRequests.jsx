import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  Select,
  message,
  Tag,
  Image,
  Divider,
  Radio,
  Tooltip,
  Table,
  Input,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  ToolOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import useTabPagination from "../../../hooks/useTabPagination";

const { Option } = Select;

const AccommodationRequests = () => {
  const {
    currentPage,
    currentPageSize,
    currentStatus,
    currentManual,
    currentSearch,
    setPage,
    setStatus,
    setManual,
    setSearch,
  } = useTabPagination("accommodation", 10);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [rowData, setRowData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [manualUpdateRecord, setManualUpdateRecord] = useState(null);
  const [searchDebounce, setSearchDebounce] = useState(currentSearch);

  // Sync searchDebounce with URL on mount
  useEffect(() => {
    setSearchDebounce(currentSearch);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDebounce !== currentSearch) {
        setSearch(searchDebounce);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchDebounce, currentSearch, setSearch]);

  const fetchAccommodationRequests = useCallback(
    async (page, pageSize, status, manual, search, showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const params = { page, limit: pageSize };
        if (status !== "all") params.status = status;
        if (manual !== "all") params.manual = manual;
        if (search) params.search = search;

        const response = await axios.get(
          `${base_url}/admin/hotels/select_hotels_requests.php`,
          { params }
        );

        if (response.data.status === "success") {
          setData(response.data.message || []);
          const pg = response.data.pagination;
          setTotal(pg?.total_records || response.data.message?.length || 0);
        } else {
          message.error("Failed to fetch accommodation requests");
        }
      } catch (error) {
        console.error("Error fetching accommodation requests:", error);
        message.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAccommodationRequests(
      currentPage,
      currentPageSize,
      currentStatus,
      currentManual,
      currentSearch
    );
  }, [
    currentPage,
    currentPageSize,
    currentStatus,
    currentManual,
    currentSearch,
  ]);

  const handleTableChange = (newPagination) => {
    setPage(newPagination.current, newPagination.pageSize);
  };

  const handleStatusUpdate = async (reserving_id, status) => {
    setUpdatingStatus(true);
    try {
      const payload = {
        reserving_id,
        status: status === "accepted" ? "upcoming" : status,
        manual: "0",
      };
      const response = await axios.post(
        `${base_url}/admin/hotels/update_status.php`,
        payload
      );
      if (response.data.status === "success") {
        message.success(
          `Status updated to ${status === "accepted" ? "upcoming" : status}`
        );
        fetchAccommodationRequests(
          currentPage,
          currentPageSize,
          currentStatus,
          currentManual,
          currentSearch,
          false
        );
        setIsModalVisible(false);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleManualStatusUpdate = async () => {
    if (!selectedStatus) {
      message.warning("Please select a status");
      return;
    }
    setUpdatingStatus(true);
    try {
      const payload = {
        reserving_id: manualUpdateRecord.reserving_id,
        status: selectedStatus,
        manual: "1",
      };
      const response = await axios.post(
        `${base_url}/admin/hotels/update_status.php`,
        payload
      );
      if (response.data.status === "success") {
        message.success(`Status manually updated to ${selectedStatus}`);
        fetchAccommodationRequests(
          currentPage,
          currentPageSize,
          currentStatus,
          currentManual,
          currentSearch,
          false
        );
        setIsManualModalVisible(false);
        setSelectedStatus("");
        setManualUpdateRecord(null);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openManualUpdateModal = (record) => {
    setManualUpdateRecord(record);
    setSelectedStatus(record.status || "");
    setIsManualModalVisible(true);
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
  };

  const parseServices = (services) => {
    if (!services || services === "null") return [];
    return services.split("**").filter(Boolean);
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: "blue",
      in_progress: "cyan",
      completed: "purple",
      pending: "orange",
      rejected: "red",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const columns = [
    {
      title: "Hotel Name",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          {text ? (
            <>
              <p className="font-semibold">{text}</p>
              <p className="text-xs text-gray-500">{record.subtitle}</p>
            </>
          ) : (
            <Tag color="orange">Custom Booking</Tag>
          )}
        </div>
      ),
    },
    {
      title: "User Info",
      dataIndex: "full_name",
      key: "full_name",
      render: (text, record) => (
        <div>
          <p className="font-medium">{text || "N/A"}</p>
          <p className="text-xs text-gray-500">{record.email || "N/A"}</p>
          <p className="text-xs text-gray-500">{record.phone || "N/A"}</p>
        </div>
      ),
    },
    {
      title: "Stay Period",
      key: "stay_period",
      render: (_, record) => {
        const duration = calculateDuration(record.start_date, record.end_date);
        return (
          <div>
            <p className="text-xs">
              <span className="font-medium">Check-in:</span> {record.start_date}
            </p>
            <p className="text-xs">
              <span className="font-medium">Check-out:</span> {record.end_date}
            </p>
            <Tag color="purple" className="mt-1">
              {duration} {duration === 1 ? "Night" : "Nights"}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text) => <p className="font-bold text-green-600">{text}</p>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <div className="flex flex-col gap-1">
          <Tag
            color={getStatusColor(text)}
            className="px-3 py-1 text-sm font-medium w-fit"
          >
            {text?.toUpperCase()}
          </Tag>
          {record.manual == "1" && (
            <Tooltip title="Manually Updated">
              <Tag color="gold" className="w-fit">
                <ToolOutlined /> Manual
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Commission",
      dataIndex: "admins",
      key: "admins",
      render: (text, record) => (
        <div className="flex flex-col gap-1">
          <p className="text-xs mb-1">{record.admins?.admin_name || "N/A"}</p>
          <p className="font-bold text-green-600">
            {record?.admins?.public_commission
              ? record.admins?.public_commission + "%"
              : ""}
          </p>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setRowData(record);
              setIsModalVisible(true);
            }}
          >
            View
          </Button>
          {record.status !== "pending" && record.status !== "rejected" && (
            <Button
              icon={<EditOutlined />}
              onClick={() => openManualUpdateModal(record)}
              className="border-orange-400 text-orange-600"
              size="small"
            >
              Change Status
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-4 p-4 bg-gray-50 rounded-lg">
        <Input
          placeholder="Search accommodations..."
          prefix={<SearchOutlined />}
          value={searchDebounce}
          onChange={(e) => setSearchDebounce(e.target.value)}
          style={{ width: 200 }}
          allowClear
          onClear={() => {
            setSearchDebounce("");
            setSearch("");
          }}
        />
        <Divider type="vertical" />
        <span className="text-gray-500 text-sm">Status:</span>
        <Select
          value={currentStatus}
          style={{ width: 150 }}
          onChange={(value) => setStatus(value)}
        >
          <Option value="all">All Status</Option>
          <Option value="pending">Pending</Option>
          <Option value="upcoming">Upcoming</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="completed">Completed</Option>
          <Option value="rejected">Rejected</Option>
        </Select>
        <Divider type="vertical" />
        <span className="text-gray-500 text-sm">Type:</span>
        <Select
          value={currentManual}
          style={{ width: 150 }}
          onChange={(value) => setManual(value)}
        >
          <Option value="all">All Types</Option>
          <Option value="0">Automatic</Option>
          <Option value="1">Manual</Option>
        </Select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="reserving_id"
        pagination={{
          current: currentPage,
          pageSize: currentPageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} requests`,
          showQuickJumper: true,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        bordered
      />

      {/* Details Modal */}
      <Modal
        title="Accommodation Request Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
      >
        {rowData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag
                color={getStatusColor(rowData.status)}
                className="px-4 py-1 text-base font-bold"
              >
                {rowData.status?.toUpperCase()}
              </Tag>
              {rowData.manual === "1" && (
                <Tag color="gold" className="px-4 py-1 text-sm font-bold">
                  <ToolOutlined className="mr-1" /> Manual Update
                </Tag>
              )}
            </div>

            {rowData.background_image && (
              <div className="grid grid-cols-4 gap-2">
                {rowData.background_image
                  .split("//CAMP//")
                  .slice(0, 4)
                  .map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${rowData.title} - ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200x130";
                      }}
                    />
                  ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">
                  Hotel Information
                </h3>
                {rowData.title ? (
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {rowData.title}
                    </p>
                    <p>
                      <span className="font-medium">Subtitle:</span>{" "}
                      {rowData.subtitle}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      <Tag color="blue">{rowData.duration}</Tag>
                    </p>
                    <div>
                      <p className="font-medium mb-1">Location:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        📍 {rowData.location}
                      </p>
                    </div>
                    <p>
                      <span className="font-medium">Price/Night:</span>{" "}
                      {rowData.price_currency}
                      {rowData.price_current}{" "}
                      <span className="line-through text-gray-400">
                        {rowData.price_currency}
                        {rowData.price_original}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 p-3 rounded">
                    <Tag color="orange">Custom Booking Request</Tag>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {rowData.full_name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {rowData.email || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {rowData.phone || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {rowData.country || "N/A"}
                  </p>
                  {rowData.passport && (
                    <div className="mt-3">
                      <p className="font-medium mb-2">Passport:</p>
                      <Image
                        src={rowData.passport}
                        alt="Passport"
                        width={200}
                        height={120}
                        style={{ objectFit: "cover" }}
                        className="rounded border"
                        fallback="https://via.placeholder.com/200x120"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {rowData.aditional_services &&
              rowData.aditional_services !== "null" && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">
                    Additional Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parseServices(rowData.aditional_services).map((s, i) => (
                      <Tag key={i} color="blue" className="text-sm px-3 py-1">
                        ✓ {s}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3">Booking Details</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Check-in</p>
                  <p className="font-semibold">{rowData.start_date}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Check-out</p>
                  <p className="font-semibold">{rowData.end_date}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Total Nights</p>
                  <p className="font-semibold">
                    {calculateDuration(rowData.start_date, rowData.end_date)}{" "}
                    Nights
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                  <p className="font-bold text-green-600 text-xl">
                    {rowData.total_amount}
                  </p>
                </div>
              </div>
            </div>

            {rowData?.status === "pending" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Update Status</h3>
                <div className="flex gap-3">
                  <Button
                    type="primary"
                    className="bg-green-500 hover:bg-green-600 border-0"
                    icon={<CheckCircleOutlined />}
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "accepted")
                    }
                    size="large"
                  >
                    ✓ Accept
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseCircleOutlined />}
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "rejected")
                    }
                    size="large"
                  >
                    ✗ Reject
                  </Button>
                  <Button onClick={() => setIsModalVisible(false)} size="large">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Manual Status Update Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ToolOutlined className="text-orange-500" />
            <span>Manual Status Update</span>
          </div>
        }
        open={isManualModalVisible}
        onCancel={() => {
          setIsManualModalVisible(false);
          setSelectedStatus("");
          setManualUpdateRecord(null);
        }}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700 mb-0">
              <ToolOutlined className="mr-2" />
              This will mark the status change as <strong>Manual Update</strong>
            </p>
          </div>
          {manualUpdateRecord && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">
                Hotel:{" "}
                <strong>{manualUpdateRecord.title || "Custom Booking"}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-0">
                Current:{" "}
                <Tag color={getStatusColor(manualUpdateRecord.status)}>
                  {manualUpdateRecord.status?.toUpperCase()}
                </Tag>
              </p>
            </div>
          )}
          <Radio.Group
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full"
          >
            <div className="flex flex-col gap-3">
              {[
                {
                  value: "upcoming",
                  label: "Upcoming",
                  desc: "Reservation confirmed",
                  color: "blue",
                },
                {
                  value: "in_progress",
                  label: "In Progress",
                  desc: "Guest checked in",
                  color: "cyan",
                },
                {
                  value: "completed",
                  label: "Completed",
                  desc: "Guest checked out",
                  color: "purple",
                },
                {
                  value: "rejected",
                  label: "Rejected",
                  desc: "Booking declined",
                  color: "red",
                },
              ].map((opt) => (
                <Radio
                  key={opt.value}
                  value={opt.value}
                  className="w-full !p-3 border rounded hover:bg-gray-50"
                >
                  <Tag color={opt.color}>{opt.label}</Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    - {opt.desc}
                  </span>
                </Radio>
              ))}
            </div>
          </Radio.Group>
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleManualStatusUpdate}
              loading={updatingStatus}
              disabled={!selectedStatus}
              className="bg-orange-500 hover:bg-orange-600 border-0"
              size="large"
            >
              Update Status
            </Button>
            <Button
              onClick={() => {
                setIsManualModalVisible(false);
                setSelectedStatus("");
                setManualUpdateRecord(null);
              }}
              size="large"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AccommodationRequests;
