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
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import useTabPagination from "../../../hooks/useTabPagination";

const { Option } = Select;

const AccommodationRequests = ({ onReadUpdated }) => {
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

  // ✅ Read helpers
  const isUnread = (read) => String(read) === "0";

  const markAsRead = useCallback(async (reservingId) => {
    try {
      await axios.post(`${base_url}/admin/read/update_read.php`, {
        reservation_id: reservingId,
        type: "hotel",
      });

      setData((prev) =>
        prev.map((item) =>
          String(item.reserving_id) === String(reservingId)
            ? { ...item, read: "1" }
            : item
        )
      );

      setRowData((prev) =>
        prev && String(prev.reserving_id) === String(reservingId)
          ? { ...prev, read: "1" }
          : prev
      );
      onReadUpdated?.();
    } catch (err) {
      console.error("Error updating read status:", err);
    }
  }, []);

  useEffect(() => {
    setSearchDebounce(currentSearch);
  }, []);

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
        console.error("Error:", error);
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

  // ✅ Open details + mark as read
  const openDetails = (record) => {
    setRowData(record);
    setIsModalVisible(true);

    if (isUnread(record.read)) {
      markAsRead(record.reserving_id);
    }
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
    } catch {
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
    } catch {
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

  const getStatusTagColor = (status) =>
    ({
      upcoming: "cyan",
      in_progress: "processing",
      completed: "default",
      pending: "warning",
      rejected: "error",
      cancelled_by_user: "error",
    })[status?.toLowerCase()] || "default";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const getFirstImage = (img) =>
    img
      ? img.split("//CAMP//")[0].trim()
      : "https://via.placeholder.com/400x300?text=No+Image";

  const getRoomsSummary = (rooms) => {
    if (!rooms || rooms.length === 0) return null;
    const totalAdults = rooms.reduce((s, r) => s + parseInt(r.adults || 0), 0);
    const totalKids = rooms.reduce((s, r) => s + parseInt(r.kids || 0), 0);
    const totalBabies = rooms.reduce((s, r) => s + parseInt(r.babies || 0), 0);
    return { totalAdults, totalKids, totalBabies, totalRooms: rooms.length };
  };

  const columns = [
    {
      title: "Hotel",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {record.background_image ? (
              <img
                src={getFirstImage(record.background_image)}
                alt={text}
                className="w-14 h-10 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/56x40?text=Hotel";
                }}
              />
            ) : (
              <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <HomeOutlined className="text-gray-400" />
              </div>
            )}
            {isUnread(record.read) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            {text ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 mb-0 text-sm">
                    {text}
                  </p>
                  {isUnread(record.read) && (
                    <Tag
                      color="green"
                      className="!m-0 !text-[10px] !font-bold !leading-none !px-1.5 !py-0.5"
                      style={{ borderRadius: 999 }}
                    >
                      NEW
                    </Tag>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-0">
                  <EnvironmentOutlined className="mr-1" />
                  {record.location?.substring(0, 30) || "N/A"}...
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Tag
                  style={{
                    background: "#f0f7f7",
                    borderColor: "#295557",
                    color: "#295557",
                  }}
                >
                  Custom Booking
                </Tag>
                {isUnread(record.read) && (
                  <Tag
                    color="green"
                    className="!m-0 !text-[10px] !font-bold !leading-none !px-1.5 !py-0.5"
                    style={{ borderRadius: 999 }}
                  >
                    NEW
                  </Tag>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Guest",
      dataIndex: "full_name",
      key: "full_name",
      render: (text, record) => (
        <div>
          <p className="font-medium text-sm mb-0">{text || "N/A"}</p>
          <p className="text-xs text-gray-400 mb-0">{record.email || "N/A"}</p>
        </div>
      ),
    },
    {
      title: "Stay",
      key: "stay",
      render: (_, record) => {
        const duration = calculateDuration(record.start_date, record.end_date);
        return (
          <div>
            <p className="text-xs mb-1 text-gray-600">
              <CalendarOutlined className="mr-1 text-[#295557]" />
              {record.start_date} → {record.end_date}
            </p>
            <Tag
              style={{
                background: "#f0f7f7",
                borderColor: "#295557",
                color: "#295557",
              }}
            >
              <ClockCircleOutlined className="mr-1" />
              {duration} {duration === 1 ? "Night" : "Nights"}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Rooms",
      key: "rooms",
      render: (_, record) => {
        const summary = getRoomsSummary(record.rooms);
        if (!summary || summary.totalRooms === 0) {
          return <span className="text-xs text-gray-400">No rooms</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <Tag
              style={{
                backgroundColor: "#295557",
                color: "#fff",
                border: "none",
              }}
            >
              {summary.totalRooms} Room(s)
            </Tag>
            <span className="text-xs text-gray-500">
              {summary.totalAdults}A
              {summary.totalKids > 0 ? ` + ${summary.totalKids}C` : ""}
              {summary.totalBabies > 0 ? ` + ${summary.totalBabies}I` : ""}
            </span>
          </div>
        );
      },
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text, record) => (
        <p className="font-bold text-lg mb-0 text-[#295557]">
          {"$"}
          {parseFloat(text).toLocaleString()}
        </p>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <div className="flex flex-col gap-1">
          <Tag color={getStatusTagColor(text)} className="w-fit font-medium">
            {text?.toUpperCase()?.replaceAll("_", " ")}
          </Tag>
          {record.manual === "1" && (
            <Tooltip title="Manually Updated">
              <Tag color="orange" className="w-fit">
                <ToolOutlined /> Manual
              </Tag>
            </Tooltip>
          )}
          {record.invite_code && (
            <Tag
              className="w-fit text-[10px]"
              style={{
                background: "#f0f7f7",
                borderColor: "#295557",
                color: "#295557",
              }}
            >
              {record.invite_code}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Commission",
      dataIndex: "admins",
      key: "admins",
      render: (admins) => (
        <div className="flex flex-col gap-1">
          {admins?.admin_name && (
            <p className="text-xs mb-0 text-gray-600">
              <UserOutlined className="mr-1 text-[#295557]" />
              {admins.admin_name}
            </p>
          )}
          {admins?.public_commission && (
            <p className="font-bold text-[#295557] mb-0">
              {admins.public_commission}%
            </p>
          )}
          {!admins?.admin_name && (
            <span className="text-xs text-gray-400">N/A</span>
          )}
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
            onClick={() => openDetails(record)}
            style={{ backgroundColor: "#295557", borderColor: "#295557" }}
          >
            View
          </Button>
          {record.status !== "pending" && record.status !== "rejected" && (
            <Button
              icon={<EditOutlined />}
              onClick={() => openManualUpdateModal(record)}
              size="small"
              style={{ borderColor: "#295557", color: "#295557" }}
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
      <div className="flex items-center gap-3 flex-wrap mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Input
          placeholder="Search accommodations..."
          prefix={<SearchOutlined className="text-[#295557]" />}
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
        <span className="text-gray-500 text-sm font-medium">Status:</span>
        <Select
          value={currentStatus}
          style={{ width: 150 }}
          onChange={(v) => setStatus(v)}
        >
          <Option value="all">All Status</Option>
          <Option value="pending">Pending</Option>
          <Option value="upcoming">Upcoming</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="completed">Completed</Option>
          <Option value="rejected">Rejected</Option>
          <Option value="cancelled_by_user">Cancelled By User</Option>
        </Select>
        <Divider type="vertical" />
        <span className="text-gray-500 text-sm font-medium">Type:</span>
        <Select
          value={currentManual}
          style={{ width: 150 }}
          onChange={(v) => setManual(v)}
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
        rowClassName={(record) => (isUnread(record.read) ? "unread-row" : "")}
        pagination={{
          current: currentPage,
          pageSize: currentPageSize,
          total,
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
        title={
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#295557" }}
            >
              <HomeOutlined className="text-white text-xl" />
            </div>
            <div>
              <h3 className="mb-0 text-lg font-bold">
                Accommodation Request Details
              </h3>
              <p className="mb-0 text-xs text-gray-500">
                Reservation #{rowData?.reserving_id}
              </p>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1100}
        className="accommodation-request-modal"
      >
        {rowData && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="relative rounded-xl overflow-hidden">
              {rowData.background_image ? (
                <img
                  src={getFirstImage(rowData.background_image)}
                  alt={rowData.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/1100x200?text=Hotel";
                  }}
                />
              ) : (
                <div
                  className="w-full h-48 flex items-center justify-center"
                  style={{ backgroundColor: "#295557" }}
                >
                  <HomeOutlined className="text-white text-6xl opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-bold mb-1">
                  {rowData.title || "Custom Booking Request"}
                </h2>
                {rowData.location && (
                  <p className="text-sm opacity-90">
                    <EnvironmentOutlined className="mr-1" />
                    {rowData.location}
                  </p>
                )}
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Tag
                  color={getStatusTagColor(rowData.status)}
                  className="px-4 py-1 text-base font-bold"
                >
                  {rowData.status?.toUpperCase()?.replaceAll("_", " ")}
                </Tag>
                {rowData.manual === "1" && (
                  <Tag color="orange" className="px-4 py-1 text-sm font-bold">
                    <ToolOutlined className="mr-1" /> Manual
                  </Tag>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className="p-4 rounded-xl text-white shadow-lg"
                style={{ backgroundColor: "#295557" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Check-in</p>
                    <p className="text-sm font-bold">
                      {formatDate(rowData.start_date)}
                    </p>
                  </div>
                  <CalendarOutlined className="text-3xl opacity-40" />
                </div>
              </div>
              <div
                className="p-4 rounded-xl text-white shadow-lg"
                style={{ backgroundColor: "#3d7a7d" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Check-out</p>
                    <p className="text-sm font-bold">
                      {formatDate(rowData.end_date)}
                    </p>
                  </div>
                  <CalendarOutlined className="text-3xl opacity-40" />
                </div>
              </div>
              <div
                className="p-4 rounded-xl text-white shadow-lg"
                style={{ backgroundColor: "#4a8f92" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Duration</p>
                    <p className="text-sm font-bold">
                      {calculateDuration(rowData.start_date, rowData.end_date)}{" "}
                      Night(s)
                    </p>
                  </div>
                  <ClockCircleOutlined className="text-3xl opacity-40" />
                </div>
              </div>
              <div
                className="p-4 rounded-xl text-white shadow-lg"
                style={{ backgroundColor: "#1a3839" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Total Amount</p>
                    <p className="text-xl font-bold">
                      {"$"}
                      {parseFloat(rowData.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <DollarOutlined className="text-3xl opacity-40" />
                </div>
              </div>
            </div>

            {/* Invite Code */}
            {rowData.invite_code && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: "#f0f7f7",
                  borderColor: "#295557",
                }}
              >
                <SafetyCertificateOutlined
                  style={{ color: "#295557" }}
                  className="text-lg"
                />
                <span className="text-sm text-gray-600 font-medium">
                  Invite Code:
                </span>
                <Tag
                  style={{
                    backgroundColor: "#295557",
                    color: "#fff",
                    border: "none",
                    fontWeight: "bold",
                    letterSpacing: 1,
                  }}
                >
                  {rowData.invite_code}
                </Tag>
              </div>
            )}

            {/* Hotel Info + Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div
                  className="px-4 py-3 border-b"
                  style={{ backgroundColor: "#f0f7f7" }}
                >
                  <h3
                    className="font-semibold mb-0 text-sm flex items-center gap-2"
                    style={{ color: "#295557" }}
                  >
                    <HomeOutlined /> Hotel Information
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {rowData.title ? (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {rowData.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {rowData.subtitle}
                          </p>
                        </div>
                      </div>
                      {rowData.location && (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg">
                          <p className="text-xs text-gray-600 mb-0">
                            <EnvironmentOutlined className="mr-1" />
                            {rowData.location}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-0">
                            Price/Night
                          </p>
                          <p
                            className="font-bold mb-0"
                            style={{ color: "#295557" }}
                          >
                            {"$"}
                            {rowData.price_current}
                          </p>
                        </div>
                        {rowData.price_original && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0">
                              Original
                            </p>
                            <p className="line-through text-gray-400 mb-0">
                              {"$"}
                              {rowData.price_original}
                            </p>
                          </div>
                        )}
                        {rowData.duration && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0">
                              Duration
                            </p>
                            <Tag
                              style={{
                                background: "#f0f7f7",
                                borderColor: "#295557",
                                color: "#295557",
                              }}
                            >
                              {rowData.duration}
                            </Tag>
                          </div>
                        )}
                      </div>
                      {rowData.price_note && (
                        <p className="text-xs text-gray-400 italic">
                          {rowData.price_note}
                        </p>
                      )}
                    </>
                  ) : (
                    <div
                      className="text-center py-6 rounded-lg border"
                      style={{
                        backgroundColor: "#f0f7f7",
                        borderColor: "#295557",
                      }}
                    >
                      <HomeOutlined
                        className="text-3xl mb-2"
                        style={{ color: "#295557" }}
                      />
                      <p
                        className="font-medium mb-0"
                        style={{ color: "#295557" }}
                      >
                        Custom Booking Request
                      </p>
                      <p className="text-xs text-gray-400 mb-0">
                        No hotel selected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div
                  className="px-4 py-3 border-b"
                  style={{ backgroundColor: "#f0f7f7" }}
                >
                  <h3
                    className="font-semibold mb-0 text-sm flex items-center gap-2"
                    style={{ color: "#295557" }}
                  >
                    <UserOutlined /> Guest Information
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0">Full Name</p>
                      <p className="font-medium text-gray-800 mb-0">
                        {rowData.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0">Country</p>
                      <p className="font-medium text-gray-800 mb-0">
                        {rowData.country || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0">Email</p>
                      <p className="text-sm text-gray-700 mb-0">
                        {rowData.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0">Phone</p>
                      <p className="text-sm text-gray-700 mb-0">
                        {rowData.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                  {rowData.passport && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-400 mb-2">
                        Passport Document
                      </p>
                      <Image
                        src={rowData.passport}
                        alt="Passport"
                        width={180}
                        height={110}
                        style={{ objectFit: "cover" }}
                        className="rounded-lg border"
                        fallback="https://via.placeholder.com/180x110"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rooms */}
            {rowData.rooms && rowData.rooms.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div
                  className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ backgroundColor: "#f0f7f7" }}
                >
                  <h3
                    className="font-semibold mb-0 text-sm flex items-center gap-2"
                    style={{ color: "#295557" }}
                  >
                    <BankOutlined /> Room Distribution
                  </h3>
                  <Tag
                    style={{
                      backgroundColor: "#295557",
                      color: "#fff",
                      border: "none",
                      fontWeight: "bold",
                    }}
                  >
                    {rowData.rooms.length}{" "}
                    {rowData.rooms.length === 1 ? "Room" : "Rooms"}
                  </Tag>
                </div>
                <div className="p-4">
                  {(() => {
                    const summary = getRoomsSummary(rowData.rooms);
                    return (
                      <div
                        className="flex items-center justify-between rounded-lg px-4 py-3 mb-4 border"
                        style={{
                          backgroundColor: "#f0f7f7",
                          borderColor: "#d1e3e4",
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <TeamOutlined style={{ color: "#295557" }} />
                            <span className="text-sm font-medium text-gray-700">
                              Total Guests:
                            </span>
                          </div>
                          <Tag
                            style={{
                              backgroundColor: "#295557",
                              color: "#fff",
                              border: "none",
                            }}
                          >
                            {summary.totalAdults} Adults
                          </Tag>
                          {summary.totalKids > 0 && (
                            <Tag
                              style={{
                                backgroundColor: "#3d7a7d",
                                color: "#fff",
                                border: "none",
                              }}
                            >
                              {summary.totalKids} Children
                            </Tag>
                          )}
                          {summary.totalBabies > 0 && (
                            <Tag
                              style={{
                                backgroundColor: "#4a8f92",
                                color: "#fff",
                                border: "none",
                              }}
                            >
                              {summary.totalBabies} Infants
                            </Tag>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {summary.totalAdults +
                            summary.totalKids +
                            summary.totalBabies}{" "}
                          guest(s) total
                        </span>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {rowData.rooms.map((room, idx) => (
                      <div
                        key={room.room_id || idx}
                        className="border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: "#295557" }}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "#295557" }}
                            >
                              Room {idx + 1}
                            </span>
                          </div>
                          {room.day > 0 && (
                            <Tag
                              className="text-[10px]"
                              style={{
                                background: "#f0f7f7",
                                borderColor: "#295557",
                                color: "#295557",
                              }}
                            >
                              Day {room.day}
                            </Tag>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                            <span className="text-xs text-gray-500">
                              Adults
                            </span>
                            <span className="text-sm font-bold text-gray-800">
                              {room.adults}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                            <span className="text-xs text-gray-500">
                              Children
                            </span>
                            <span className="text-sm font-bold text-gray-800">
                              {room.kids}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                            <span className="text-xs text-gray-500">
                              Infants
                            </span>
                            <span
                              className="text-sm font-bold"
                              style={{
                                color:
                                  parseInt(room.babies) > 0
                                    ? "#295557"
                                    : "#9ca3af",
                              }}
                            >
                              {room.babies}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100 text-center">
                          <span className="text-xs text-gray-400">
                            {parseInt(room.adults) + parseInt(room.kids)}{" "}
                            countable
                            {parseInt(room.babies) > 0
                              ? ` + ${room.babies} infant(s)`
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Services */}
            {rowData.aditional_services &&
              rowData.aditional_services !== "null" &&
              rowData.aditional_services !== "" && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className="px-4 py-3 border-b"
                    style={{ backgroundColor: "#f0f7f7" }}
                  >
                    <h3
                      className="font-semibold mb-0 text-sm flex items-center gap-2"
                      style={{ color: "#295557" }}
                    >
                      <CheckCircleOutlined /> Additional Services
                    </h3>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {rowData.aditional_services
                      .split(",")
                      .filter(Boolean)
                      .map((s, i) => (
                        <Tag
                          key={i}
                          style={{
                            background: "#f0f7f7",
                            borderColor: "#295557",
                            color: "#295557",
                          }}
                          className="px-3 py-1"
                        >
                          <CheckCircleOutlined className="mr-1" />
                          {s.trim()}
                        </Tag>
                      ))}
                  </div>
                </div>
              )}

            {/* Commission */}
            {rowData.admins?.admin_name && (
              <div
                className="flex items-center gap-4 px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: "#f0f7f7",
                  borderColor: "#295557",
                }}
              >
                <UserOutlined
                  style={{ color: "#295557" }}
                  className="text-lg"
                />
                <div>
                  <span className="text-sm text-gray-600">Agent: </span>
                  <span className="font-semibold text-gray-800">
                    {rowData.admins.admin_name}
                  </span>
                </div>
                {rowData.admins.public_commission && (
                  <Tag
                    style={{
                      backgroundColor: "#295557",
                      color: "#fff",
                      border: "none",
                      fontWeight: "bold",
                    }}
                  >
                    {rowData.admins.public_commission}% Commission
                  </Tag>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {rowData.status === "pending" && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-base mb-4 text-gray-800">
                  Update Status
                </h3>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "accepted")
                    }
                    style={{
                      backgroundColor: "#295557",
                      borderColor: "#295557",
                    }}
                    className="h-12 px-8"
                  >
                    Accept Booking
                  </Button>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<CloseCircleOutlined />}
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "rejected")
                    }
                    className="h-12 px-8"
                  >
                    Reject Booking
                  </Button>
                  <Button
                    size="large"
                    onClick={() => setIsModalVisible(false)}
                    className="h-12 px-8"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Manual Status Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ToolOutlined style={{ color: "#295557" }} />
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
        <div className="flex flex-col gap-3">
          <div
            className="border rounded-lg p-4"
            style={{ backgroundColor: "#f0f7f7", borderColor: "#295557" }}
          >
            <p className="text-sm mb-0" style={{ color: "#295557" }}>
              <ToolOutlined className="mr-2" />
              This will mark the status change as <strong>Manual Update</strong>
            </p>
          </div>
          {manualUpdateRecord && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                Hotel:{" "}
                <strong>{manualUpdateRecord.title || "Custom Booking"}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-0">
                Current:{" "}
                <Tag color={getStatusTagColor(manualUpdateRecord.status)}>
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
            <div className="flex flex-col gap-2">
              {[
                {
                  value: "upcoming",
                  label: "Upcoming",
                  desc: "Reservation confirmed",
                },
                {
                  value: "in_progress",
                  label: "In Progress",
                  desc: "Guest checked in",
                },
                {
                  value: "completed",
                  label: "Completed",
                  desc: "Guest checked out",
                },
                {
                  value: "rejected",
                  label: "Rejected",
                  desc: "Booking declined",
                },
              ].map((opt) => (
                <Radio
                  key={opt.value}
                  value={opt.value}
                  className="w-full !p-3 border rounded hover:bg-gray-50"
                  style={
                    selectedStatus === opt.value
                      ? {
                          borderColor: "#295557",
                          backgroundColor: "#f0f7f7",
                        }
                      : {}
                  }
                >
                  <Tag
                    color={
                      opt.value === "rejected"
                        ? "error"
                        : opt.value === "completed"
                          ? "default"
                          : "processing"
                    }
                    style={
                      opt.value !== "rejected" && opt.value !== "completed"
                        ? {
                            backgroundColor: "#f0f7f7",
                            borderColor: "#295557",
                            color: "#295557",
                          }
                        : {}
                    }
                  >
                    {opt.label}
                  </Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    — {opt.desc}
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
              size="large"
              style={{ backgroundColor: "#295557", borderColor: "#295557" }}
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

      <style jsx global>{`
        .accommodation-request-modal .ant-modal-body {
          max-height: 80vh;
          overflow-y: auto;
        }
        .ant-table-tbody > tr.unread-row > td {
          background-color: #f6ffed !important;
        }
        .ant-table-tbody > tr.unread-row:hover > td {
          background-color: #eaffd6 !important;
        }
        .ant-table-tbody > tr.unread-row > td:first-child {
          border-left: 4px solid #295557 !important;
        }
      `}</style>
    </>
  );
};

export default AccommodationRequests;
