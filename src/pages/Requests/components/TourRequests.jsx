import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  Select,
  message,
  Tag,
  Table,
  Divider,
  Tooltip,
  Badge,
  Collapse,
  Empty,
  Radio,
  Input,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  CarOutlined,
  HomeOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  GlobalOutlined,
  FlagOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  ToolOutlined,
  SearchOutlined,
  UserOutlined,
  BankOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import useTabPagination from "../../../hooks/useTabPagination";

const { Option } = Select;
const { Panel } = Collapse;

// ═══════════════════════════════════════════
// PARSERS - handle duplicate days by MERGING
// ═══════════════════════════════════════════

// "1**5**day**1**4**day**1**2**day**2**5**day**2**4"
// → { "1": ["5","4","2"], "2": ["5","4"] }
const parseDayActivities = (str) => {
  if (!str) return {};
  const result = {};
  str.split("**day**").forEach((part) => {
    const segs = part.split("**").filter(Boolean);
    if (segs.length < 2) return;
    const day = segs[0];
    const ids = segs
      .slice(1)
      .flatMap((s) => s.split(","))
      .map((id) => id.trim())
      .filter((id) => id && id !== "0");
    if (!result[day]) result[day] = [];
    result[day].push(...ids);
    result[day] = [...new Set(result[day])];
  });
  return result;
};

// "1**3**1**day**1**4**1**day**2**2**0**day**2**3**1"
// → { "1": [{carId:"3",withDriver:true},{carId:"4",withDriver:true}], "2": [{carId:"2",withDriver:false},{carId:"3",withDriver:true}] }
const parseDayCar = (str) => {
  if (!str) return {};
  const result = {};
  str.split("**day**").forEach((part) => {
    const segs = part.split("**").filter(Boolean);
    if (segs.length < 3) return;
    const day = segs[0];
    const carId = segs[1];
    const withDriver = segs[2] === "1";
    if (!result[day]) result[day] = [];
    result[day].push({ carId, withDriver });
  });
  return result;
};

// "1**1**20**day**2**1**30"
// → { "1": {isSelected:true, price:"20"}, "2": {isSelected:true, price:"30"} }
const parseDayTourGuide = (str) => {
  if (!str) return {};
  const result = {};
  str.split("**day**").forEach((part) => {
    const segs = part.split("**").filter(Boolean);
    if (segs.length < 3) return;
    result[segs[0]] = { isSelected: segs[1] === "1", price: segs[2] };
  });
  return result;
};

// "1**2**day**2**2"
// → { "1": "2", "2": "2" }
const parseDayHotel = (str) => {
  if (!str) return {};
  const result = {};
  str.split("**day**").forEach((part) => {
    const segs = part.split("**").filter(Boolean);
    if (segs.length < 2) return;
    result[segs[0]] = segs[1];
  });
  return result;
};

// ═══════════════════════════════════════════

const TourRequests = () => {
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
  } = useTabPagination("tour", 10);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [rowData, setRowData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [manualUpdateRecord, setManualUpdateRecord] = useState(null);
  const [searchDebounce, setSearchDebounce] = useState(currentSearch);

  // ✅ Lookup maps for cars, activities, hotels
  const [carsLookup, setCarsLookup] = useState({});
  const [activitiesLookup, setActivitiesLookup] = useState({});
  const [hotelsLookup, setHotelsLookup] = useState({});

  // ── Fetch lookups once ──
  const fetchLookups = useCallback(async () => {
    try {
      const [carsRes, activitiesRes, hotelsRes] = await Promise.all([
        axios.get(`${base_url}/admin/cars/select_cars.php`),
        axios.get(`${base_url}/admin/activities/select_activities.php`),
        axios.get(`${base_url}/admin/hotels/select_hotels.php`),
      ]);

      setCarsLookup(
        Object.fromEntries(
          (carsRes.data.message || []).map((c) => [String(c.id), c])
        )
      );
      setActivitiesLookup(
        Object.fromEntries(
          (activitiesRes.data.message || []).map((a) => [String(a.id), a])
        )
      );
      setHotelsLookup(
        Object.fromEntries(
          (hotelsRes.data.message || []).map((h) => [String(h.id), h])
        )
      );
    } catch (err) {
      console.error("Error fetching lookups:", err);
    }
  }, []);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  // ── Search debounce ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDebounce !== currentSearch) setSearch(searchDebounce);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchDebounce, currentSearch, setSearch]);

  // ── Fetch tour requests ──
  const fetchTourRequests = useCallback(
    async (page, pageSize, status, manual, search, showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const params = { page, limit: pageSize };
        if (status !== "all") params.status = status;
        if (manual !== "all") params.manual = manual;
        if (search) params.search = search;

        const response = await axios.get(
          `${base_url}/admin/tours/tour_requests.php`,
          { params }
        );

        if (response.data.status === "success") {
          setData(response.data.message || []);
          const pg = response.data.pagination;
          setTotal(pg?.total_records || response.data.message?.length || 0);
        } else {
          message.error("Failed to fetch tour requests");
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
    fetchTourRequests(
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

  const handleTableChange = (p) => setPage(p.current, p.pageSize);

  // ── Fetch details ──
  const fetchTourRequestDetails = async (reservationId) => {
    setDetailsLoading(true);
    try {
      const res = await axios.post(
        `${base_url}/admin/tours/tour_request_details.php`,
        { reservation_id: reservationId }
      );
      if (res.data.status === "success") {
        setRowData(res.data.message);
        setIsModalVisible(true);
      } else {
        message.error("Failed to fetch details");
      }
    } catch (err) {
      message.error("Error fetching details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // ── Status updates ──
  const handleStatusUpdate = async (reservationId, status) => {
    setUpdatingStatus(true);
    try {
      const res = await axios.post(
        `${base_url}/admin/tours/update_status.php`,
        {
          reservation_id: reservationId,
          status: status === "accepted" ? "upcoming" : status,
          manual: "0",
        }
      );
      if (res.data.status === "success") {
        message.success(
          `Status updated to ${status === "accepted" ? "upcoming" : status}`
        );
        fetchTourRequests(
          currentPage,
          currentPageSize,
          currentStatus,
          currentManual,
          currentSearch,
          false
        );
        setIsModalVisible(false);
      } else {
        message.error(res.data.message || "Failed");
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
      const res = await axios.post(
        `${base_url}/admin/tours/update_status.php`,
        {
          reservation_id: manualUpdateRecord.reservation_id,
          status: selectedStatus,
          manual: "1",
        }
      );
      if (res.data.status === "success") {
        message.success(`Status manually updated to ${selectedStatus}`);
        fetchTourRequests(
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
        message.error(res.data.message || "Failed");
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

  // ── Helpers ──
  const calculateDuration = (s, e) => {
    return (
      Math.ceil(Math.abs(new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24)) + 1
    );
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
      ? img.split("//CAMP//")[0]
      : "https://via.placeholder.com/400x300?text=No+Image";

  // ═══════════════════════════════════════════
  // TABLE COLUMNS
  // ═══════════════════════════════════════════
  const columns = [
    {
      title: "Tour",
      dataIndex: ["reservation", "tour_title"],
      key: "tour_title",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <img
            src={getFirstImage(record.tour_details?.image)}
            alt={text}
            className="w-16 h-12 object-cover rounded-lg shadow-sm"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/64x48?text=Tour";
            }}
          />
          <div>
            <p className="font-semibold text-gray-800 mb-0 text-sm">{text}</p>
            <p className="text-xs text-gray-400 mb-0">
              <EnvironmentOutlined className="mr-1" />
              {record.tour_details?.route?.substring(0, 30)}...
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Travelers",
      key: "travelers",
      render: (_, r) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge
              count={r.reservation?.num_adults}
              style={{ backgroundColor: "#295557" }}
            />
            <span className="text-xs text-gray-500">Adults</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              count={r.reservation?.num_children || 0}
              style={{ backgroundColor: "#3d7a7d" }}
            />
            <span className="text-xs text-gray-500">Children</span>
          </div>
          {parseInt(r.reservation?.num_infants) > 0 && (
            <div className="flex items-center gap-2">
              <Badge
                count={r.reservation?.num_infants}
                style={{ backgroundColor: "#6b9e9f" }}
              />
              <span className="text-xs text-gray-500">Infants</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Travel Dates",
      key: "dates",
      render: (_, r) => {
        const dur = calculateDuration(
          r.reservation?.start_date,
          r.reservation?.end_date
        );
        return (
          <div>
            <p className="text-xs mb-1 text-gray-600">
              <CalendarOutlined className="mr-1 text-[#295557]" />
              {r.reservation?.start_date}
            </p>
            <p className="text-xs mb-1 text-gray-600">
              <CalendarOutlined className="mr-1 text-[#295557]" />
              {r.reservation?.end_date}
            </p>
            <Tag
              style={{
                background: "#f0f7f7",
                borderColor: "#295557",
                color: "#295557",
              }}
            >
              <ClockCircleOutlined className="mr-1" />
              {dur} Days
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Total",
      dataIndex: ["reservation", "total_amount"],
      key: "total_amount",
      render: (text, r) => (
        <p className="font-bold text-xl mb-0 text-center text-[#295557]">
          {r.tour_details?.price_currency || "$"}
          {parseFloat(text).toLocaleString()}
        </p>
      ),
    },
    {
      title: "Status",
      dataIndex: ["reservation", "status"],
      key: "status",
      render: (text, r) => (
        <div className="flex flex-col gap-1">
          <Tag color={getStatusTagColor(text)} className="w-fit font-medium">
            {text?.toUpperCase()?.replaceAll("_", " ")}
          </Tag>
          {r.reservation?.manual === "1" && (
            <Tooltip title="Manually Updated">
              <Tag color="orange" className="w-fit">
                <ToolOutlined /> Manual
              </Tag>
            </Tooltip>
          )}
          {r.reservation?.invite_code && (
            <Tag
              className="w-fit text-[10px]"
              style={{
                background: "#f0f7f7",
                borderColor: "#295557",
                color: "#295557",
              }}
            >
              {r.reservation.invite_code}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Commission",
      dataIndex: ["reservation", "admins"],
      key: "admins",
      render: (text) => (
        <div className="flex flex-col gap-1">
          {text?.admin_name && (
            <p className="text-xs mb-1 text-gray-600">
              <UserOutlined className="mr-1 text-[#295557]" />
              {text.admin_name}
            </p>
          )}
          {text?.tour_commission && (
            <p className="font-bold text-[#295557]">{text.tour_commission}%</p>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, r) => (
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() =>
              fetchTourRequestDetails(r.reservation?.reservation_id)
            }
            loading={detailsLoading}
            size="small"
            style={{ backgroundColor: "#295557", borderColor: "#295557" }}
          >
            View
          </Button>
          {r.reservation?.status !== "pending" &&
            r.reservation?.status !== "rejected" && (
              <Button
                icon={<EditOutlined />}
                onClick={() => openManualUpdateModal(r.reservation)}
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

  // ═══════════════════════════════════════════
  // PARSED DATA for modal
  // ═══════════════════════════════════════════
  const parsed = rowData
    ? {
        cars: parseDayCar(rowData.reservation?.day_car),
        activities: parseDayActivities(rowData.reservation?.day_activities),
        guide: parseDayTourGuide(rowData.reservation?.day_tour_guide),
        hotel: parseDayHotel(rowData.reservation?.day_hotel),
      }
    : null;

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <>
      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Input
          placeholder="Search tours..."
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

      {/* ── Table ── */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={(r) => r.reservation?.reservation_id}
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

      {/* ══════════════════════════════════════════
          DETAILS MODAL
      ══════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#295557" }}
            >
              <GlobalOutlined className="!text-white text-xl" />
            </div>
            <div>
              <h3 className="mb-0 text-lg font-bold">Tour Request Details</h3>
              <p className="mb-0 text-xs text-gray-500">
                Reservation #{rowData?.reservation?.reservation_id}
              </p>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1200}
        className="tour-request-modal"
      >
        {rowData && parsed && (
          <div className="space-y-6">
            {/* ── Hero ── */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={getFirstImage(rowData.tour_details?.image)}
                alt={rowData.tour_details?.title}
                className="w-full h-52 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x200?text=Tour";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-bold mb-1">
                  {rowData.tour_details?.title}
                </h2>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span>
                    <EnvironmentOutlined className="mr-1" />
                    {rowData.tour_details?.route}
                  </span>
                  <span>
                    <ClockCircleOutlined className="mr-1" />
                    {rowData.tour_details?.duration}
                  </span>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Tag
                  color={getStatusTagColor(rowData.reservation?.status)}
                  className="px-4 py-1 text-base font-bold"
                >
                  {rowData.reservation?.status
                    ?.toUpperCase()
                    ?.replaceAll("_", " ")}
                </Tag>
                {rowData.reservation?.manual === "1" && (
                  <Tag color="orange" className="px-4 py-1 text-sm font-bold">
                    <ToolOutlined className="mr-1" /> Manual
                  </Tag>
                )}
              </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className="p-4 rounded-xl text-white shadow-lg"
                style={{ backgroundColor: "#295557" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Start Date</p>
                    <p className="text-sm font-bold">
                      {formatDate(rowData.reservation?.start_date)}
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
                    <p className="text-xs opacity-80 mb-1">End Date</p>
                    <p className="text-sm font-bold">
                      {formatDate(rowData.reservation?.end_date)}
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
                    <p className="text-xs opacity-80 mb-1">Travelers</p>
                    <p className="text-sm font-bold">
                      {rowData.reservation?.num_adults}A
                      {parseInt(rowData.reservation?.num_children) > 0
                        ? ` + ${rowData.reservation.num_children}C`
                        : ""}
                      {parseInt(rowData.reservation?.num_infants) > 0
                        ? ` + ${rowData.reservation.num_infants}I`
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
                      {rowData.tour_details?.price_currency || "$"}
                      {parseFloat(
                        rowData.reservation?.total_amount
                      ).toLocaleString()}
                    </p>
                  </div>
                  <DollarOutlined className="text-3xl opacity-40" />
                </div>
              </div>
            </div>

            {/* ── Invite Code ── */}
            {rowData.reservation?.invite_code && (
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
                  {rowData.reservation.invite_code}
                </Tag>
              </div>
            )}

            {/* ══════════════════════════════════
                ITINERARY
            ══════════════════════════════════ */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <FlagOutlined style={{ color: "#295557" }} />
                <span style={{ color: "#295557" }}>Reserved Itinerary</span>
              </h3>

              {rowData.tour_details?.itinerary?.length > 0 ? (
                <Collapse
                  defaultActiveKey={["0"]}
                  className="bg-white rounded-lg shadow-sm"
                  expandIconPosition="end"
                >
                  {rowData.tour_details.itinerary.map((day, index) => {
                    const dk = String(day.day);

                    // ── Build full objects from parsed IDs + lookups ──
                    const parsedCarEntries = parsed.cars[dk] || [];
                    const parsedActivityIds = parsed.activities[dk] || [];
                    const parsedHotelId = parsed.hotel[dk];
                    const dayGuide = parsed.guide[dk];
                    const rooms = day.hotel_reserved?.rooms || [];

                    // Cars: from lookup
                    const carsForDay = parsedCarEntries.map((entry, idx) => ({
                      ...(carsLookup[String(entry.carId)] || {}),
                      carId: entry.carId,
                      withDriver: entry.withDriver,
                      _idx: idx,
                    }));

                    // Activities: from lookup
                    const activitiesForDay = parsedActivityIds.map(
                      (id, idx) => ({
                        ...(activitiesLookup[String(id)] || {}),
                        activityId: id,
                        _idx: idx,
                      })
                    );

                    // Hotel: from lookup
                    const hotelForDay =
                      hotelsLookup[String(parsedHotelId)] || null;

                    return (
                      <Panel
                        key={index}
                        header={
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                style={{ backgroundColor: "#295557" }}
                              >
                                {day.day}
                              </div>
                              <div>
                                <p className="font-semibold mb-0 text-gray-800">
                                  {day.title}
                                </p>
                                <p className="text-xs text-gray-400 mb-0">
                                  Day {day.day}
                                  {carsForDay.length > 0 &&
                                    ` — ${carsForDay.length} car(s)`}
                                  {activitiesForDay.length > 0 &&
                                    ` — ${activitiesForDay.length} activity(s)`}
                                  {rooms.length > 0 &&
                                    ` — ${rooms.length} room(s)`}
                                </p>
                              </div>
                            </div>
                            <Tag
                              style={
                                day.need_tour_guide == 1
                                  ? {
                                      backgroundColor: "#f0f7f7",
                                      borderColor: "#295557",
                                      color: "#295557",
                                    }
                                  : {}
                              }
                              color={day.need_tour_guide == 1 ? "" : "default"}
                            >
                              <SafetyCertificateOutlined />{" "}
                              {day.need_tour_guide == 1
                                ? `Guide ($${dayGuide?.price || 0})`
                                : "No Guide"}
                            </Tag>
                          </div>
                        }
                      >
                        <div className="space-y-4 py-2">
                          {/* Description */}
                          {day.description && (
                            <div
                              className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg"
                              dangerouslySetInnerHTML={{
                                __html: day.description,
                              }}
                            />
                          )}

                          {/* ── 3 Columns ── */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* ══ HOTEL + ROOMS ══ */}
                            <div className="border rounded-xl overflow-hidden">
                              <div
                                className="px-3 py-2 border-b flex items-center justify-between"
                                style={{ backgroundColor: "#f0f7f7" }}
                              >
                                <p
                                  className="font-semibold mb-0 text-sm"
                                  style={{ color: "#295557" }}
                                >
                                  <HomeOutlined className="mr-1" /> Hotel &
                                  Rooms
                                </p>
                                {rooms.length > 0 && (
                                  <Tag
                                    style={{
                                      backgroundColor: "#295557",
                                      color: "#fff",
                                      border: "none",
                                      fontSize: 10,
                                    }}
                                  >
                                    {rooms.length} room(s)
                                  </Tag>
                                )}
                              </div>
                              <div className="p-3">
                                {/* Hotel info from lookup */}
                                {hotelForDay ? (
                                  <>
                                    {hotelForDay.image && (
                                      <img
                                        src={getFirstImage(hotelForDay.image)}
                                        alt={hotelForDay.title}
                                        className="w-full h-20 object-cover rounded-lg mb-2"
                                        onError={(e) => {
                                          e.target.src =
                                            "https://via.placeholder.com/200x80";
                                        }}
                                      />
                                    )}
                                    <p className="font-semibold text-xs text-gray-700 mb-1 truncate">
                                      {hotelForDay.title}
                                    </p>
                                    {hotelForDay.adult_price && (
                                      <p
                                        className="text-xs font-bold mb-2"
                                        style={{ color: "#295557" }}
                                      >
                                        ${hotelForDay.adult_price} / adult
                                      </p>
                                    )}
                                  </>
                                ) : parsedHotelId ? (
                                  <p className="text-xs text-gray-500 mb-2">
                                    Hotel ID: {parsedHotelId}
                                  </p>
                                ) : null}

                                {/* Rooms */}
                                {rooms.length > 0 ? (
                                  <div className="space-y-1.5 mt-1">
                                    {rooms.map((room, rIdx) => (
                                      <div
                                        key={rIdx}
                                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 border border-gray-200 bg-gray-50"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <BankOutlined
                                            className="text-xs"
                                            style={{ color: "#295557" }}
                                          />
                                          <span
                                            className="text-xs font-medium"
                                            style={{ color: "#295557" }}
                                          >
                                            Room {rIdx + 1}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                          <span className="font-medium">
                                            {room.adults}A
                                          </span>
                                          {parseInt(room.kids) > 0 && (
                                            <span>{room.kids}C</span>
                                          )}
                                          {parseInt(room.babies) > 0 && (
                                            <span
                                              className="font-medium"
                                              style={{ color: "#295557" }}
                                            >
                                              {room.babies}I
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  !hotelForDay && (
                                    <div className="text-center py-4 text-gray-400">
                                      <HomeOutlined className="text-xl" />
                                      <p className="text-xs mt-1">No hotel</p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {/* ══ CARS (MULTIPLE) ══ */}
                            <div className="border rounded-xl overflow-hidden">
                              <div
                                className="px-3 py-2 border-b flex items-center justify-between"
                                style={{ backgroundColor: "#f0f7f7" }}
                              >
                                <p
                                  className="font-semibold mb-0 text-sm"
                                  style={{ color: "#295557" }}
                                >
                                  <CarOutlined className="mr-1" /> Transfer
                                </p>
                                {carsForDay.length > 0 && (
                                  <Tag
                                    style={{
                                      backgroundColor: "#295557",
                                      color: "#fff",
                                      border: "none",
                                      fontSize: 10,
                                    }}
                                  >
                                    {carsForDay.length} car(s)
                                  </Tag>
                                )}
                              </div>
                              <div className="p-3">
                                {carsForDay.length > 0 ? (
                                  <div className="space-y-3">
                                    {carsForDay.map((car, idx) => (
                                      <div
                                        key={`${car.carId}-${idx}`}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                      >
                                        {car.image && (
                                          <img
                                            src={getFirstImage(car.image)}
                                            alt={car.title || "Car"}
                                            className="w-full h-16 object-cover"
                                            onError={(e) => {
                                              e.target.src =
                                                "https://via.placeholder.com/200x64";
                                            }}
                                          />
                                        )}
                                        <div className="px-2.5 py-2">
                                          <p className="font-medium text-xs text-gray-700 truncate mb-1">
                                            {car.title ||
                                              `Car ID: ${car.carId}`}
                                          </p>
                                          <div className="flex items-center justify-between">
                                            <span
                                              className="text-xs font-bold"
                                              style={{ color: "#295557" }}
                                            >
                                              {car.price_current
                                                ? `$${car.price_current}/day`
                                                : `ID: ${car.carId}`}
                                            </span>
                                            <Tag
                                              className="text-[10px]"
                                              style={
                                                car.withDriver
                                                  ? {
                                                      backgroundColor:
                                                        "#f0f7f7",
                                                      borderColor: "#295557",
                                                      color: "#295557",
                                                    }
                                                  : {}
                                              }
                                              color={
                                                car.withDriver ? "" : "default"
                                              }
                                            >
                                              {car.withDriver
                                                ? "With Driver"
                                                : "Self Drive"}
                                            </Tag>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-400">
                                    <CarOutlined className="text-xl" />
                                    <p className="text-xs mt-1">No car</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ══ ACTIVITIES (MULTIPLE) ══ */}
                            <div className="border rounded-xl overflow-hidden">
                              <div
                                className="px-3 py-2 border-b flex items-center justify-between"
                                style={{ backgroundColor: "#f0f7f7" }}
                              >
                                <p
                                  className="font-semibold mb-0 text-sm"
                                  style={{ color: "#295557" }}
                                >
                                  <FlagOutlined className="mr-1" /> Activities
                                </p>
                                {activitiesForDay.length > 0 && (
                                  <Tag
                                    style={{
                                      backgroundColor: "#295557",
                                      color: "#fff",
                                      border: "none",
                                      fontSize: 10,
                                    }}
                                  >
                                    {activitiesForDay.length}
                                  </Tag>
                                )}
                              </div>
                              <div className="p-3">
                                {activitiesForDay.length > 0 ? (
                                  <div className="space-y-3">
                                    {activitiesForDay.map((activity, idx) => (
                                      <div
                                        key={`${activity.activityId}-${idx}`}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                      >
                                        {activity.image && (
                                          <img
                                            src={getFirstImage(activity.image)}
                                            alt={activity.title || "Activity"}
                                            className="w-full h-16 object-cover"
                                            onError={(e) => {
                                              e.target.src =
                                                "https://via.placeholder.com/200x64";
                                            }}
                                          />
                                        )}
                                        <div className="px-2.5 py-2">
                                          <p className="font-medium text-xs text-gray-700 truncate mb-1">
                                            {activity.title ||
                                              `Activity ID: ${activity.activityId}`}
                                          </p>
                                          <div className="flex items-center justify-between flex-wrap gap-1">
                                            <span
                                              className="text-xs font-bold"
                                              style={{ color: "#295557" }}
                                            >
                                              {activity.price_current
                                                ? `$${activity.price_current}`
                                                : `ID: ${activity.activityId}`}
                                            </span>
                                            {activity.for_children === "1" && (
                                              <Tag
                                                className="text-[10px]"
                                                style={{
                                                  backgroundColor: "#f0f7f7",
                                                  borderColor: "#295557",
                                                  color: "#295557",
                                                }}
                                              >
                                                Kid-Friendly
                                              </Tag>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-400">
                                    <FlagOutlined className="text-xl" />
                                    <p className="text-xs mt-1">No activity</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Panel>
                    );
                  })}
                </Collapse>
              ) : (
                <Empty description="No itinerary available" />
              )}
            </div>

            {/* ── Includes / Excludes ── */}
            {(rowData.tour_details?.includes?.length > 0 ||
              rowData.tour_details?.excludes?.length > 0) && (
              <div className="grid grid-cols-2 gap-6">
                {rowData.tour_details?.includes?.length > 0 && (
                  <div
                    className="rounded-xl p-4 border"
                    style={{
                      backgroundColor: "#f0f7f7",
                      borderColor: "#295557",
                    }}
                  >
                    <h4
                      className="font-bold mb-3 text-sm"
                      style={{ color: "#295557" }}
                    >
                      <CheckCircleOutlined className="mr-1" /> What's Included
                    </h4>
                    <ul className="space-y-1">
                      {rowData.tour_details.includes.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <CheckCircleOutlined
                            className="mt-0.5 shrink-0"
                            style={{ color: "#295557" }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rowData.tour_details?.excludes?.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <h4 className="font-bold text-red-700 mb-3 text-sm">
                      <CloseCircleOutlined className="mr-1" /> What's Not
                      Included
                    </h4>
                    <ul className="space-y-1">
                      {rowData.tour_details.excludes.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <CloseCircleOutlined className="text-red-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Action Buttons ── */}
            {rowData.reservation?.status?.toLowerCase() === "pending" && (
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
                      handleStatusUpdate(
                        rowData.reservation?.reservation_id,
                        "accepted"
                      )
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
                      handleStatusUpdate(
                        rowData.reservation?.reservation_id,
                        "rejected"
                      )
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

      {/* ══════════════════════════════════════════
          MANUAL STATUS MODAL
      ══════════════════════════════════════════ */}
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
                Reservation:{" "}
                <strong>#{manualUpdateRecord.reservation_id}</strong>
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
                  desc: "Trip is scheduled",
                },
                {
                  value: "in_progress",
                  label: "In Progress",
                  desc: "Trip is ongoing",
                },
                {
                  value: "completed",
                  label: "Completed",
                  desc: "Trip finished",
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
        .tour-request-modal .ant-modal-body {
          max-height: 80vh;
          overflow-y: auto;
        }
        .ant-collapse-header {
          align-items: center !important;
        }
      `}</style>
    </>
  );
};

export default TourRequests;
