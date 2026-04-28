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
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  ToolOutlined,
  SearchOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import useTabPagination from "../../../hooks/useTabPagination";

const { Option } = Select;

const ActivitiesRequests = ({ onReadUpdated }) => {
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
  } = useTabPagination("activity", 10);

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
        type: "activity",
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

  const fetchActivitiesRequests = useCallback(
    async (page, pageSize, status, manual, search, showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const params = { page, limit: pageSize };
        if (status !== "all") params.status = status;
        if (manual !== "all") params.manual = manual;
        if (search) params.search = search;

        const response = await axios.get(
          `${base_url}/admin/activities/select_activities_requests.php`,
          { params }
        );

        if (response.data?.status === "success") {
          setData(response.data.message || []);
          const pg = response.data.pagination;
          setTotal(pg?.total_records || response.data.message?.length || 0);
        } else {
          message.error("Failed to fetch activities requests");
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
    fetchActivitiesRequests(
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
        `${base_url}/admin/activities/update_status.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data?.status === "success") {
        message.success(
          `Status updated to ${status === "accepted" ? "upcoming" : status}`
        );
        fetchActivitiesRequests(
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
        `${base_url}/admin/activities/update_status.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data?.status === "success") {
        message.success(`Status manually updated to ${selectedStatus}`);
        fetchActivitiesRequests(
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

  const getStatusTagColor = (status) =>
    ({
      upcoming: "cyan",
      in_progress: "processing",
      completed: "default",
      pending: "warning",
      rejected: "error",
      cancelled_by_user: "error",
    })[status?.toLowerCase()] || "default";

  const getFirstImage = (img) =>
    img
      ? img.split("//CAMP//")[0].trim()
      : "https://via.placeholder.com/400x300?text=No+Image";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const columns = [
    {
      title: "Activity",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={getFirstImage(record.background_image)}
              alt={text}
              className="w-14 h-10 object-cover rounded-lg shadow-sm"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/56x40?text=Activity";
              }}
            />
            {isUnread(record.read) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-800 mb-0 text-sm">{text}</p>
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
              <ThunderboltOutlined className="mr-1" />
              {record.activity_type}
            </p>
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
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => (
        <p className="text-xs mb-0 text-gray-600">
          <CalendarOutlined className="mr-1 text-[#295557]" />
          {text}
        </p>
      ),
    },
    {
      title: "Participants",
      key: "participants",
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge
              count={record.adults_num}
              style={{ backgroundColor: "#295557" }}
              overflowCount={99}
            />
            <span className="text-xs text-gray-500">Adults</span>
          </div>
          {record.childs_num > 0 && (
            <div className="flex items-center gap-2">
              <Badge
                count={record.childs_num}
                style={{ backgroundColor: "#3d7a7d" }}
                overflowCount={99}
              />
              <span className="text-xs text-gray-500">Children</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text, record) => (
        <p className="font-bold text-lg mb-0 text-[#295557]">
          {record.price_currency || "$"}
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
          {admins?.admin_name ? (
            <>
              <p className="text-xs mb-0 text-gray-600">
                <UserOutlined className="mr-1 text-[#295557]" />
                {admins.admin_name}
              </p>
              {admins.public_commission && (
                <p className="font-bold text-[#295557] mb-0">
                  {admins.public_commission}%
                </p>
              )}
            </>
          ) : (
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
          placeholder="Search activities..."
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
              <ThunderboltOutlined className="text-white text-xl" />
            </div>
            <div>
              <h3 className="mb-0 text-lg font-bold">
                Activity Request Details
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
        width={1000}
        className="activity-request-modal"
      >
        {rowData && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={getFirstImage(rowData.image)}
                alt={rowData.title}
                className="w-full h-52 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1000x200?text=Activity";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Tag
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.4)",
                    }}
                    className="text-xs"
                  >
                    <ThunderboltOutlined className="mr-1" />
                    {rowData.activity_type}
                  </Tag>
                  {rowData.for_children === "1" && (
                    <Tag
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}
                      className="text-xs"
                    >
                      Kid-Friendly
                    </Tag>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-1">{rowData.title}</h2>
                <p className="text-sm opacity-90 mb-1">{rowData.subtitle}</p>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span>
                    <EnvironmentOutlined className="mr-1" />
                    {rowData.route}
                  </span>
                  <span>
                    <ClockCircleOutlined className="mr-1" />
                    {rowData.duration}
                  </span>
                </div>
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
                    <p className="text-xs opacity-80 mb-1">Date</p>
                    <p className="text-sm font-bold">
                      {formatDate(rowData.date)}
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
                    <p className="text-xs opacity-80 mb-1">Duration</p>
                    <p className="text-sm font-bold">{rowData.duration}</p>
                  </div>
                  <ClockCircleOutlined className="text-3xl opacity-40" />
                </div>
              </div>
              <div
                className="p-4 rounded-xl text-white shadow-lg"
                style={{ backgroundColor: "#4a8f92" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Participants</p>
                    <p className="text-sm font-bold">
                      {rowData.adults_num}A
                      {rowData.childs_num > 0
                        ? ` + ${rowData.childs_num}C`
                        : ""}
                    </p>
                  </div>
                  <TeamOutlined className="text-3xl opacity-40" />
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
                      {rowData.price_currency || "$"}
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

            {/* Activity Info + Guest Info */}
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
                    <ThunderboltOutlined /> Activity Information
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 mb-0">
                        {rowData.title}
                      </p>
                      <p className="text-xs text-gray-400 mb-0">
                        {rowData.subtitle}
                      </p>
                    </div>
                    {rowData.for_children === "1" && (
                      <Tag
                        style={{
                          background: "#f0f7f7",
                          borderColor: "#295557",
                          color: "#295557",
                        }}
                      >
                        Kid-Friendly
                      </Tag>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0">Type</p>
                      <p className="font-medium text-gray-800 mb-0 text-sm">
                        {rowData.activity_type}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0">Duration</p>
                      <p className="font-medium text-gray-800 mb-0 text-sm">
                        {rowData.duration}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0">Route</p>
                    <p className="font-medium text-gray-800 mb-0 text-sm">
                      <EnvironmentOutlined
                        className="mr-1"
                        style={{ color: "#295557" }}
                      />
                      {rowData.route}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0">Price</p>
                      <p
                        className="font-bold mb-0"
                        style={{ color: "#295557" }}
                      >
                        {rowData.price_currency || "$"}
                        {rowData.price_current}
                      </p>
                    </div>
                    {rowData.price_original && (
                      <div>
                        <p className="text-xs text-gray-400 mb-0">Original</p>
                        <p className="line-through text-gray-400 mb-0">
                          {rowData.price_currency || "$"}
                          {rowData.price_original}
                        </p>
                      </div>
                    )}
                    {rowData.price_note && (
                      <div>
                        <p className="text-xs text-gray-400 mb-0">Note</p>
                        <p className="text-xs text-gray-500 italic mb-0">
                          {rowData.price_note}
                        </p>
                      </div>
                    )}
                  </div>
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
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0">Full Name</p>
                      <p className="font-medium text-gray-800 mb-0 text-sm">
                        {rowData.full_name || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0">Age</p>
                      <p className="font-medium text-gray-800 mb-0 text-sm">
                        {rowData.age || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0">Email</p>
                      <p className="font-medium text-gray-800 mb-0 text-sm truncate">
                        {rowData.email || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0">Phone</p>
                      <p className="font-medium text-gray-800 mb-0 text-sm">
                        {rowData.phone || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2 col-span-2">
                      <p className="text-xs text-gray-400 mb-0">Country</p>
                      <p className="font-medium text-gray-800 mb-0 text-sm">
                        {rowData.country || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: "#f0f7f7",
                      borderColor: "#d1e3e4",
                    }}
                  >
                    <p
                      className="text-xs font-medium mb-2"
                      style={{ color: "#295557" }}
                    >
                      <TeamOutlined className="mr-1" /> Participants
                    </p>
                    <div className="flex items-center gap-3">
                      <Tag
                        style={{
                          backgroundColor: "#295557",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        {rowData.adults_num} Adults
                      </Tag>
                      {rowData.childs_num > 0 && (
                        <Tag
                          style={{
                            backgroundColor: "#3d7a7d",
                            color: "#fff",
                            border: "none",
                          }}
                        >
                          {rowData.childs_num} Children
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission */}
            {rowData.admins && Object.keys(rowData.admins).length > 0 && (
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
                Activity: <strong>{manualUpdateRecord.title}</strong>
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
                  desc: "Activity is scheduled",
                },
                {
                  value: "in_progress",
                  label: "In Progress",
                  desc: "Activity is ongoing",
                },
                {
                  value: "completed",
                  label: "Completed",
                  desc: "Activity finished",
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
        .activity-request-modal .ant-modal-body {
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

export default ActivitiesRequests;
