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
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

  // Filter data based on status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item) => item.reservation?.status?.toLowerCase() === statusFilter
      );
      setFilteredData(filtered);
    }
  }, [statusFilter, data]);

  // Update status
  const handleStatusUpdate = async (reservationId, status) => {
    setUpdatingStatus(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/tours/update_status.php`,
        {
          reservation_id: reservationId,
          status,
        }
      );

      if (response.data.status === "success") {
        message.success(`Status updated to ${status}`);
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
      accepted: "green",
      confirmed: "green",
      pending: "orange",
      rejected: "red",
      cancelled: "red",
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
      render: (text) => (
        <Tag
          color={getStatusColor(text)}
          className="px-3 py-1 text-sm font-medium"
        >
          {text?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() =>
            fetchTourRequestDetails(record.reservation?.reservation_id)
          }
          loading={detailsLoading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-md hover:shadow-lg"
        >
          View Details
        </Button>
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
                <span className="text-gray-500 text-sm">Filter by:</span>
                <Select
                  defaultValue="all"
                  style={{ width: 150 }}
                  onChange={(value) => setStatusFilter(value)}
                >
                  <Option value="all">All Status</Option>
                  <Option value="pending">
                    <Tag color="orange">Pending</Tag>
                  </Option>
                  <Option value="accepted">
                    <Tag color="green">Accepted</Tag>
                  </Option>
                  <Option value="rejected">
                    <Tag color="red">Rejected</Tag>
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

      {/* Details Modal */}
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
              <Tag
                color={getStatusColor(rowData.reservation?.status)}
                className="absolute top-4 right-4 px-4 py-1 text-base font-bold"
              >
                {rowData.reservation?.status?.toUpperCase()}
              </Tag>
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
                      }
                    >
                      <div className="space-y-4">
                        {/* Day Description */}
                        <div
                          className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg"
                          dangerouslySetInnerHTML={{
                            __html: day.description || "No description",
                          }}
                        />

                        {/* Reserved Items Grid */}
                        <div className="grid grid-cols-3 gap-4">
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
                                  className="w-full h-24 object-cover rounded-lg mb-2"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/200x100?text=Hotel";
                                  }}
                                />
                                <p className="font-medium text-sm mb-1">
                                  {day.hotel_reserved.title}
                                </p>
                                <div className="flex justify-between text-xs text-gray-500">
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
                                  className="w-full h-24 object-cover rounded-lg mb-2"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/200x100?text=Car";
                                  }}
                                />
                                <p className="font-medium text-sm mb-1">
                                  {day.car_reserved.title}
                                </p>
                                <p className="text-green-600 font-bold text-sm">
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
                                  className="w-full h-24 object-cover rounded-lg mb-2"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/200x100?text=Activity";
                                  }}
                                />
                                <p className="font-medium text-sm mb-1">
                                  {day.activity_reserved.title}
                                </p>
                                <p className="text-purple-600 font-bold text-sm">
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
                {/* Includes */}
                {rowData.tour_details?.includes?.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircleOutlined /> What's Included
                    </h4>
                    <ul className="space-y-2">
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

                {/* Excludes */}
                {rowData.tour_details?.excludes?.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                      <CloseCircleOutlined /> What's Not Included
                    </h4>
                    <ul className="space-y-2">
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
