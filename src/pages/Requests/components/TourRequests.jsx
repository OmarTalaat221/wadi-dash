import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Modal,
  Select,
  message,
  Tag,
  Image,
  Divider,
  Timeline,
  Tooltip,
  Badge,
  Collapse,
  Empty,
  Radio,
} from "antd";
import {
  UserOutlined,
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
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  FlagOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import DataTable from "../../../layout/DataTable";
import axios from "axios";
import { base_url } from "../../../utils/base_url";

const { Option } = Select;
const { Panel } = Collapse;

const TourRequests = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [manualFilter, setManualFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [manualUpdateRecord, setManualUpdateRecord] = useState(null);

  // Fetch tour requests
  const fetchTourRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/tours/tour_requests.php`
      );

      if (response.data.status === "success") {
        setData(response.data.message);
        setFilteredData(response.data.message);
      } else {
        message.error("Failed to fetch tour requests");
      }
    } catch (error) {
      console.error("Error fetching tour requests:", error);
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchTourRequests();
  }, []);

  // Filter data based on status and manual
  useEffect(() => {
    let filtered = data;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.reservation?.status?.toLowerCase() === statusFilter
      );
    }

    // Filter by manual
    if (manualFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.reservation?.manual === manualFilter
      );
    }

    setFilteredData(filtered);
  }, [statusFilter, manualFilter, data]);

  // Update status - Accept/Reject (Automatic - manual: "0")
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
        fetchTourRequests();
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

  // Manual status update (manual: "1")
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
        fetchTourRequests();
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

  // Open manual update modal
  const openManualUpdateModal = (record) => {
    setManualUpdateRecord(record);
    setSelectedStatus(record.status || "");
    setIsManualModalVisible(true);
  };

  // Calculate duration
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Get status color
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

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get first image from image string
  const getFirstImage = (imageStr) => {
    if (!imageStr) return "https://via.placeholder.com/400x300?text=No+Image";
    return imageStr.split("//CAMP//")[0];
  };

  const headers = [
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
        <div className="text-center">
          <p className="font-bold text-xl text-green-600 mb-0">
            {record.tour_details?.price_currency || "$"}
            {parseFloat(text).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {record.tour_details?.price_note}
          </p>
        </div>
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() =>
              fetchTourRequestDetails(record.reservation?.reservation_id)
            }
            loading={detailsLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-md hover:shadow-lg"
            size="small"
          >
            View
          </Button>
          {record.reservation?.status !== "pending" && (
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
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <Card
            bordered={false}
            className="!w-full mb-24 shadow-sm"
            title={
              <div className="flex items-center gap-2">
                <GlobalOutlined className="text-blue-500" />
                <span>Tour Package Requests</span>
              </div>
            }
            extra={
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Status:</span>
                <Select
                  defaultValue="all"
                  style={{ width: 150 }}
                  onChange={(value) => setStatusFilter(value)}
                >
                  <Option value="all">All Status</Option>
                  <Option value="pending">
                    <>Pending</>
                  </Option>
                  <Option value="upcoming">
                    <>Upcoming</>
                  </Option>
                  <Option value="in_progress">
                    <>In Progress</>
                  </Option>
                  <Option value="completed">
                    <>Completed</>
                  </Option>
                  <Option value="rejected">
                    <>Rejected</>
                  </Option>
                </Select>

                <Divider type="vertical" />

                <span className="text-gray-500 text-sm">Type:</span>
                <Select
                  defaultValue="all"
                  style={{ width: 150 }}
                  onChange={(value) => setManualFilter(value)}
                >
                  <Option value="all">All Types</Option>
                  <Option value="0">
                    <>Automatic</>
                  </Option>
                  <Option value="1">
                    <>Manual</>
                  </Option>
                </Select>
              </div>
            }
          >
            <DataTable
              loading={loading}
              addBtn={false}
              searchPlaceholder={"Search for Tour Requests"}
              table={{ header: headers, rows: filteredData }}
              bordered={true}
              onSearchChabnge={() => {}}
              onAddClick={() => {}}
              btnText=""
            />
          </Card>
        </Col>
      </Row>

      {/* Details Modal - الـ Modal القديم بالظبط */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
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

            {/* Booking Summary Cards */}
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

            {/* Itinerary Section */}
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
                          <Tooltip
                            title={
                              day.need_tour_guide == 1
                                ? "Tour Guide Included"
                                : "No Tour Guide"
                            }
                          >
                            <Tag
                              color={
                                day.need_tour_guide == 1 ? "green" : "default"
                              }
                              className="flex items-center gap-1"
                            >
                              <SafetyCertificateOutlined />
                              {day.need_tour_guide == 1
                                ? "Guide ✓"
                                : "No Guide"}
                            </Tag>
                          </Tooltip>
                        </div>
                      }
                    >
                      <div className="my-4">
                        <div
                          className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg"
                          dangerouslySetInnerHTML={{
                            __html: day.description || "No description",
                          }}
                        />

                        <div className="grid grid-cols-4 gap-4">
                          {/* Tour Guide */}
                          <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="bg-amber-50 px-3 py-2 border-b">
                              <p className="font-semibold text-amber-700 mb-0 flex items-center gap-2">
                                <SafetyCertificateOutlined /> Tour Guide
                              </p>
                            </div>
                            <div className="p-4 text-center">
                              {day.need_tour_guide == 1 ? (
                                <div className="flex flex-col items-center">
                                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                                    <SafetyCertificateOutlined className="text-3xl text-white" />
                                  </div>
                                  <Tag
                                    color="success"
                                    className="text-sm font-medium"
                                  >
                                    <CheckCircleOutlined className="mr-1" />
                                    Included
                                  </Tag>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Professional guide assigned
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                                    <SafetyCertificateOutlined className="text-3xl text-gray-400" />
                                  </div>
                                  <Tag color="default" className="text-sm">
                                    <CloseCircleOutlined className="mr-1" />
                                    Not Included
                                  </Tag>
                                  <p className="text-xs text-gray-400 mt-2">
                                    Self-guided day
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hotel */}
                          <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="bg-blue-50 px-3 py-2 border-b">
                              <p className="font-semibold text-blue-700 mb-0 flex items-center gap-2">
                                <HomeOutlined /> Hotel Reserved
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
                                      "https://via.placeholder.com/200x100?text=Hotel";
                                  }}
                                />
                                <p className="font-medium text-xs mb-1 truncate">
                                  {day.hotel_reserved.title}
                                </p>
                                <div className="flex flex-col text-xs text-gray-500">
                                  <span>
                                    Adult: ${day.hotel_reserved.adult_price}
                                  </span>
                                  <span>
                                    Child: ${day.hotel_reserved.child_price}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-400">
                                <HomeOutlined className="text-2xl mb-2" />
                                <p className="text-xs">No hotel reserved</p>
                              </div>
                            )}
                          </div>

                          {/* Car */}
                          <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="bg-green-50 px-3 py-2 border-b">
                              <p className="font-semibold text-green-700 mb-0 flex items-center gap-2">
                                <CarOutlined /> Car Reserved
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
                                      "https://via.placeholder.com/200x100?text=Car";
                                  }}
                                />
                                <p className="font-medium text-xs mb-1 truncate">
                                  {day.car_reserved.title}
                                </p>
                                <p className="text-green-600 font-bold text-xs">
                                  ${day.car_reserved.price_current}/day
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-400">
                                <CarOutlined className="text-2xl mb-2" />
                                <p className="text-xs">No car reserved</p>
                              </div>
                            )}
                          </div>

                          {/* Activity */}
                          <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="bg-purple-50 px-3 py-2 border-b">
                              <p className="font-semibold text-purple-700 mb-0 flex items-center gap-2">
                                <FlagOutlined /> Activity Reserved
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
                                      "https://via.placeholder.com/200x100?text=Activity";
                                  }}
                                />
                                <p className="font-medium text-xs mb-1 truncate">
                                  {day.activity_reserved.title}
                                </p>
                                <p className="text-purple-600 font-bold text-xs">
                                  ${day.activity_reserved.price_current}
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-400">
                                <FlagOutlined className="text-2xl mb-2" />
                                <p className="text-xs">No activity reserved</p>
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

            {/* Tour Includes/Excludes */}
            {(rowData.tour_details?.includes?.length > 0 ||
              rowData.tour_details?.excludes?.length > 0) && (
              <div className="grid grid-cols-2 gap-6">
                {rowData.tour_details?.includes?.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircleOutlined /> What's Included
                    </h4>
                    <ul className="my-2">
                      {rowData.tour_details.includes.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircleOutlined className="text-green-500 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rowData.tour_details?.excludes?.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                      <CloseCircleOutlined /> What's Not Included
                    </h4>
                    <ul className="my-2">
                      {rowData.tour_details.excludes.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CloseCircleOutlined className="text-red-500 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Only for pending */}
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
                    className="bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl h-12 px-8"
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
                    className="shadow-lg hover:shadow-xl h-12 px-8"
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
                Reservation ID:{" "}
                <strong>#{manualUpdateRecord.reservation_id}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-0">
                Current Status:{" "}
                <Tag color={getStatusColor(manualUpdateRecord.status)}>
                  {manualUpdateRecord.status?.toUpperCase()}
                </Tag>
              </p>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">Select New Status:</label>
            <Radio.Group
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full "
            >
              <div className="flex flex-col gap-2">
                <Radio
                  value="upcoming"
                  className="w-full !p-3 border rounded hover:bg-blue-50"
                >
                  <Tag color="blue">Upcoming</Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    - Trip is scheduled
                  </span>
                </Radio>
                <Radio
                  value="in_progress"
                  className="w-full !p-3 border rounded hover:bg-cyan-50"
                >
                  <Tag color="cyan">In Progress</Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    - Trip is ongoing
                  </span>
                </Radio>
                <Radio
                  value="completed"
                  className="w-full !p-3 border rounded hover:bg-purple-50"
                >
                  <Tag color="purple">Completed</Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    - Trip finished
                  </span>
                </Radio>
                <Radio
                  value="rejected"
                  className="w-full !p-3 border rounded hover:bg-red-50"
                >
                  <Tag color="red">Rejected</Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    - Booking declined
                  </span>
                </Radio>
              </div>
            </Radio.Group>
          </div>

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

      {/* Custom Styles */}
      <style jsx global>{`
        .tour-request-modal .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
        }
        .tour-request-modal .ant-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }
        .tour-request-modal .ant-modal-body {
          padding: 24px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .tour-request-modal .ant-collapse-header {
          padding: 16px !important;
          align-items: center !important;
        }
        .tour-request-modal .ant-collapse-content-box {
          padding: 16px !important;
        }
      `}</style>
    </>
  );
};

export default TourRequests;
