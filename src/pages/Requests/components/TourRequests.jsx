import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  Row,
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
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import useTabPagination from "../../../hooks/useTabPagination";

const { Option } = Select;
const { Panel } = Collapse;

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDebounce !== currentSearch) {
        setSearch(searchDebounce);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchDebounce, currentSearch, setSearch]);

  // Fetch tour requests
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
        console.error("Error fetching tour requests:", error);
        message.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch when URL params change
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

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    setPage(newPagination.current, newPagination.pageSize);
  };

  // Fetch tour request details
  const fetchTourRequestDetails = async (reservationId) => {
    setDetailsLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/tours/tour_request_details.php`,
        { reservation_id: reservationId }
      );
      if (response.data.status === "success") {
        setRowData(response.data.message);
        setIsModalVisible(true);
      } else {
        message.error("Failed to fetch tour request details");
      }
    } catch (error) {
      console.error("Error fetching tour request details:", error);
      message.error("Error fetching details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Update status - Automatic
  const handleStatusUpdate = async (reservationId, status) => {
    setUpdatingStatus(true);
    try {
      const payload = {
        reservation_id: reservationId,
        status: status === "accepted" ? "upcoming" : status,
        manual: "0",
      };
      const response = await axios.post(
        `${base_url}/admin/tours/update_status.php`,
        payload
      );
      if (response.data.status === "success") {
        message.success(
          `Status updated to ${status === "accepted" ? "upcoming" : status}`
        );
        fetchTourRequests(
          currentPage,
          currentPageSize,
          currentStatus,
          currentManual,
          false
        );
        setIsModalVisible(false);
      } else {
        message.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Manual status update
  const handleManualStatusUpdate = async () => {
    if (!selectedStatus) {
      message.warning("Please select a status");
      return;
    }
    setUpdatingStatus(true);
    try {
      const payload = {
        reservation_id: manualUpdateRecord.reservation_id,
        status: selectedStatus,
        manual: "1",
      };
      const response = await axios.post(
        `${base_url}/admin/tours/update_status.php`,
        payload
      );
      if (response.data.status === "success") {
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
        message.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
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
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFirstImage = (imageStr) => {
    if (!imageStr) return "https://via.placeholder.com/400x300?text=No+Image";
    return imageStr.split("//CAMP//")[0];
  };

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
            <p className="font-semibold text-gray-800 mb-0">{text}</p>
            <p className="text-xs text-gray-500 mb-0">
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
      render: (_, record) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Badge
              count={record.reservation?.num_adults}
              style={{ backgroundColor: "#1890ff" }}
              overflowCount={99}
            />
            <span className="text-xs text-gray-600">Adults</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge
              count={record.reservation?.num_children || 0}
              style={{ backgroundColor: "#52c41a" }}
              overflowCount={99}
            />
            <span className="text-xs text-gray-600">Children</span>
          </div>
        </div>
      ),
    },
    {
      title: "Travel Dates",
      key: "dates",
      render: (_, record) => {
        const duration = calculateDuration(
          record.reservation?.start_date,
          record.reservation?.end_date
        );
        return (
          <div>
            <p className="text-xs mb-1">
              <CalendarOutlined className="mr-1 text-blue-500" />
              {record.reservation?.start_date}
            </p>
            <p className="text-xs mb-1">
              <CalendarOutlined className="mr-1 text-red-500" />
              {record.reservation?.end_date}
            </p>
            <Tag color="purple" className="mt-1">
              <ClockCircleOutlined className="mr-1" />
              {duration} Days
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Total Amount",
      dataIndex: ["reservation", "total_amount"],
      key: "total_amount",
      render: (text, record) => (
        <p className="font-bold text-xl text-green-600 mb-0 text-center">
          {record.tour_details?.price_currency || "$"}
          {parseFloat(text).toLocaleString()}
        </p>
      ),
    },
    {
      title: "Status",
      dataIndex: ["reservation", "status"],
      key: "status",
      render: (text, record) => (
        <div className="flex flex-col gap-1">
          <Tag
            color={getStatusColor(text)}
            className="px-3 py-1 text-sm font-medium w-fit"
          >
            {text?.toUpperCase()}
          </Tag>
          {record.reservation?.manual === "1" && (
            <Tooltip title="Manually Updated">
              <Tag
                color="gold"
                className="flex items-center gap-1 justify-center w-fit"
              >
                Manual
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },

    {
      title: "Commission",
      dataIndex: ["reservation", "admins"],
      key: "admins",
      render: (text) => (
        <div className="flex flex-col gap-2">
          <p className="text-xs mb-1">
            <CalendarOutlined className="mr-1 text-blue-500" />
            {text?.admin_name}
          </p>

          <p className="font-bold text-green-600">
            {text?.tour_commission ? text?.tour_commission + "%" : ""}
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
            onClick={() =>
              fetchTourRequestDetails(record.reservation?.reservation_id)
            }
            loading={detailsLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-md"
            size="small"
          >
            View
          </Button>
          {record.reservation?.status !== "pending" &&
            record.reservation?.status !== "rejected" && (
              <Button
                icon={<EditOutlined />}
                onClick={() => openManualUpdateModal(record.reservation)}
                className="border-orange-400 text-orange-600 hover:bg-orange-50"
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
          placeholder="Search tours..."
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
        rowKey={(record) => record.reservation?.reservation_id}
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
        title={
          <div className="flex items-center gap-3">
            <div className="bg-[#295557] text-white p-2 rounded-lg">
              <GlobalOutlined className="text-white text-xl" />
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
        {rowData && (
          <div className="space-y-6">
            {/* Tour Header */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={getFirstImage(rowData.tour_details?.image)}
                alt={rowData.tour_details?.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x200?text=Tour+Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-bold mb-1">
                  {rowData.tour_details?.title}
                </h2>
                <p className="text-sm opacity-90 mb-2">
                  {rowData.tour_details?.subtitle}
                </p>
                <div className="flex items-center gap-4 text-sm">
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
                  color={getStatusColor(rowData.reservation?.status)}
                  className="px-4 py-1 text-base font-bold"
                >
                  {rowData.reservation?.status?.toUpperCase()}
                </Tag>
                {rowData.reservation?.manual === "1" && (
                  <Tag color="gold" className="px-4 py-1 text-sm font-bold">
                    <ToolOutlined className="mr-1" /> Manual
                  </Tag>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Start Date</p>
                    <p className="text-lg font-bold">
                      {formatDate(rowData.reservation?.start_date)}
                    </p>
                  </div>
                  <CalendarOutlined className="text-3xl opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">End Date</p>
                    <p className="text-lg font-bold">
                      {formatDate(rowData.reservation?.end_date)}
                    </p>
                  </div>
                  <CalendarOutlined className="text-3xl opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Travelers</p>
                    <p className="text-lg font-bold">
                      {rowData.reservation?.num_adults} Adults,{" "}
                      {rowData.reservation?.num_children || 0} Children
                    </p>
                  </div>
                  <TeamOutlined className="text-3xl opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold">
                      {rowData.tour_details?.price_currency || "$"}
                      {parseFloat(
                        rowData.reservation?.total_amount
                      ).toLocaleString()}
                    </p>
                  </div>
                  <DollarOutlined className="text-3xl opacity-50" />
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FlagOutlined className="text-blue-500" />
                Reserved Itinerary
              </h3>
              {rowData.tour_details?.itinerary?.length > 0 ? (
                <Collapse
                  defaultActiveKey={["0"]}
                  className="bg-white rounded-lg shadow-sm"
                  expandIconPosition="end"
                >
                  {rowData.tour_details.itinerary.map((day, index) => (
                    <Panel
                      key={index}
                      header={
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                              {day.day}
                            </div>
                            <div>
                              <p className="font-semibold mb-0">{day.title}</p>
                              <p className="text-xs text-gray-500 mb-0">
                                Day {day.day} of Tour
                              </p>
                            </div>
                          </div>
                          <Tag
                            color={
                              day.need_tour_guide == 1 ? "green" : "default"
                            }
                          >
                            <SafetyCertificateOutlined />{" "}
                            {day.need_tour_guide == 1 ? "Guide ✓" : "No Guide"}
                          </Tag>
                        </div>
                      }
                    >
                      <div className="my-4">
                        <div
                          className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg mb-4"
                          dangerouslySetInnerHTML={{
                            __html: day.description || "No description",
                          }}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {/* Tour Guide */}
                          <div className="border rounded-xl overflow-hidden">
                            <div className="bg-amber-50 px-3 py-2 border-b">
                              <p className="font-semibold text-amber-700 mb-0">
                                <SafetyCertificateOutlined /> Tour Guide
                              </p>
                            </div>
                            <div className="p-4 text-center">
                              {day.need_tour_guide == 1 ? (
                                <Tag color="success">
                                  <CheckCircleOutlined /> Included
                                </Tag>
                              ) : (
                                <Tag color="default">
                                  <CloseCircleOutlined /> Not Included
                                </Tag>
                              )}
                            </div>
                          </div>
                          {/* Hotel */}
                          <div className="border rounded-xl overflow-hidden">
                            <div className="bg-blue-50 px-3 py-2 border-b">
                              <p className="font-semibold text-blue-700 mb-0">
                                <HomeOutlined /> Hotel
                              </p>
                            </div>
                            {day.hotel_reserved ? (
                              <div className="p-3">
                                <img
                                  src={getFirstImage(day.hotel_reserved.image)}
                                  alt={day.hotel_reserved.title}
                                  className="w-full h-20 object-cover rounded-lg mb-2"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/200x100";
                                  }}
                                />
                                <p className="font-medium text-xs truncate">
                                  {day.hotel_reserved.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Adult: ${day.hotel_reserved.adult_price}
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-400">
                                <HomeOutlined className="text-2xl" />
                                <p className="text-xs">No hotel</p>
                              </div>
                            )}
                          </div>
                          {/* Car */}
                          <div className="border rounded-xl overflow-hidden">
                            <div className="bg-green-50 px-3 py-2 border-b">
                              <p className="font-semibold text-green-700 mb-0">
                                <CarOutlined /> Car
                              </p>
                            </div>
                            {day.car_reserved ? (
                              <div className="p-3">
                                <img
                                  src={getFirstImage(day.car_reserved.image)}
                                  alt={day.car_reserved.title}
                                  className="w-full h-20 object-cover rounded-lg mb-2"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/200x100";
                                  }}
                                />
                                <p className="font-medium text-xs truncate">
                                  {day.car_reserved.title}
                                </p>
                                <p className="text-green-600 font-bold text-xs">
                                  ${day.car_reserved.price_current}/day
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-400">
                                <CarOutlined className="text-2xl" />
                                <p className="text-xs">No car</p>
                              </div>
                            )}
                          </div>
                          {/* Activity */}
                          <div className="border rounded-xl overflow-hidden">
                            <div className="bg-purple-50 px-3 py-2 border-b">
                              <p className="font-semibold text-purple-700 mb-0">
                                <FlagOutlined /> Activity
                              </p>
                            </div>
                            {day.activity_reserved ? (
                              <div className="p-3">
                                <img
                                  src={getFirstImage(
                                    day.activity_reserved.image
                                  )}
                                  alt={day.activity_reserved.title}
                                  className="w-full h-20 object-cover rounded-lg mb-2"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/200x100";
                                  }}
                                />
                                <p className="font-medium text-xs truncate">
                                  {day.activity_reserved.title}
                                </p>
                                <p className="text-purple-600 font-bold text-xs">
                                  ${day.activity_reserved.price_current}
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-400">
                                <FlagOutlined className="text-2xl" />
                                <p className="text-xs">No activity</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <Empty description="No itinerary details available" />
              )}
            </div>

            {/* Includes / Excludes */}
            {(rowData.tour_details?.includes?.length > 0 ||
              rowData.tour_details?.excludes?.length > 0) && (
              <div className="grid grid-cols-2 gap-6">
                {rowData.tour_details?.includes?.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-green-700 mb-3">
                      <CheckCircleOutlined /> What's Included
                    </h4>
                    <ul className="my-2">
                      {rowData.tour_details.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircleOutlined className="text-green-500 mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rowData.tour_details?.excludes?.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-red-700 mb-3">
                      <CloseCircleOutlined /> What's Not Included
                    </h4>
                    <ul className="my-2">
                      {rowData.tour_details.excludes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CloseCircleOutlined className="text-red-500 mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {rowData.reservation?.status?.toLowerCase() === "pending" && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Update Status</h3>
                <div className="flex gap-4">
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
                    className="bg-gradient-to-r from-green-500 to-green-600 border-0 h-12 px-8"
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
        <div className="flex flex-col gap-3">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700 mb-0">
              <ToolOutlined className="mr-2" />
              This will mark the status change as <strong>Manual Update</strong>
            </p>
          </div>
          {manualUpdateRecord && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">
                Reservation:{" "}
                <strong>#{manualUpdateRecord.reservation_id}</strong>
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
            <div className="flex flex-col gap-2">
              {[
                {
                  value: "upcoming",
                  label: "Upcoming",
                  desc: "Trip is scheduled",
                  color: "blue",
                },
                {
                  value: "in_progress",
                  label: "In Progress",
                  desc: "Trip is ongoing",
                  color: "cyan",
                },
                {
                  value: "completed",
                  label: "Completed",
                  desc: "Trip finished",
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

      <style jsx global>{`
        .tour-request-modal .ant-modal-body {
          max-height: 80vh;
          overflow-y: auto;
        }
      `}</style>
    </>
  );
};

export default TourRequests;
