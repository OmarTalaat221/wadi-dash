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
} from "antd";
import DataTable from "../../../layout/DataTable";
import axios from "axios";
import { base_url } from "../../../utils/base_url";

const { Option } = Select;

const CarsRequests = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch cars requests
  const fetchCarsRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/cars/select_cars_requests.php`
      );

      if (response.data.status === "success") {
        setData(response.data.message);
        setFilteredData(response.data.message);
      } else {
        message.error("Failed to fetch cars requests");
      }
    } catch (error) {
      console.error("Error fetching cars requests:", error);
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarsRequests();
  }, []);

  // Filter data based on status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item) => item.status?.toLowerCase() === statusFilter
      );
      setFilteredData(filtered);
    }
  }, [statusFilter, data]);

  // Update status
  const handleStatusUpdate = async (reserving_id, status) => {
    setUpdatingStatus(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/cars/update_status.php`,
        {
          reserving_id,
          status,
        }
      );

      if (response.data.status === "success") {
        message.success(`Status updated to ${status}`);
        fetchCarsRequests(); // Refresh data
        setIsModalVisible(false);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Calculate rental duration
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const headers = [
    {
      title: "Car Name",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          {text ? (
            <>
              <p className="font-semibold">{text}</p>
              <p className="text-xs text-gray-500">{record.subtitle}</p>
              <Tag color="blue" className="mt-1">
                {record.car_type}
              </Tag>
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
          <p className="font-medium">{text}</p>
          <p className="text-xs text-gray-500">{record.email}</p>
          <p className="text-xs text-gray-500">{record.phone}</p>
        </div>
      ),
    },
    {
      title: "Rental Period",
      dataIndex: "start_date",
      key: "rental_period",
      render: (text, record) => {
        const duration = calculateDuration(record.start_date, record.end_date);
        return (
          <div>
            <p className="text-xs">
              <span className="font-medium">From:</span> {record.start_date}
            </p>
            <p className="text-xs">
              <span className="font-medium">To:</span> {record.end_date}
            </p>
            <Tag color="purple" className="mt-1">
              {duration} {duration === 1 ? "Day" : "Days"}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <Tag color={text === "self_riding" ? "cyan" : "green"}>
          {text === "self_riding" ? "Self Riding" : "With Driver"}
        </Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text, record) => (
        <div>
          <p className="font-bold text-green-600">
            {record.price_currency || "$"}
            {text}
          </p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        const status = text?.toLowerCase() || "pending";
        const colors = {
          accepted: "green",
          pending: "orange",
          rejected: "red",
        };
        return (
          <Tag color={colors[status] || "default"}>{status.toUpperCase()}</Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div>
          <Button
            className="bg-primary text-white"
            type="primary"
            onClick={() => {
              setRowData(record);
              setIsModalVisible(true);
            }}
          >
            View Details
          </Button>
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
            className="!w-full mb-24"
            title="Cars Requests"
            extra={
              <Select
                value={statusFilter}
                style={{ width: 150 }}
                onChange={(value) => setStatusFilter(value)}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="accepted">Accepted</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            }
          >
            <div className="">
              <DataTable
                loading={loading}
                addBtn={false}
                searchPlaceholder={"Search for Cars Requests"}
                table={{ header: headers, rows: filteredData }}
                bordered={true}
                onSearchChabnge={() => {}}
                onAddClick={() => {}}
                btnText=""
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Details Modal */}
      <Modal
        title="Car Rental Request Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
      >
        {rowData && (
          <div className="space-y-4">
            {/* Car Image */}
            {rowData.image && (
              <div className="flex justify-center">
                <img
                  src={rowData.image?.split("//CAMP//")[0]}
                  alt={rowData.title || "Car"}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x400";
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Car Details */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">
                  Car Information
                </h3>
                <div className="space-y-2">
                  {rowData.title ? (
                    <>
                      <p>
                        <span className="font-medium">Title:</span>{" "}
                        {rowData.title}
                      </p>
                      <p>
                        <span className="font-medium">Subtitle:</span>{" "}
                        {rowData.subtitle}
                      </p>
                      <p>
                        <span className="font-medium">Car Type:</span>{" "}
                        <Tag color="blue">{rowData.car_type}</Tag>
                      </p>
                      <p>
                        <span className="font-medium">Price per Day:</span>{" "}
                        {rowData.price_currency}
                        {rowData.price_current}{" "}
                        <span className="line-through text-gray-400">
                          {rowData.price_currency}
                          {rowData.price_original}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {rowData.price_note}
                      </p>
                    </>
                  ) : (
                    <div className="bg-orange-50 p-3 rounded">
                      <Tag color="orange">Custom Booking Request</Tag>
                      <p className="text-sm mt-2">
                        Customer requested a custom car rental
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {rowData.full_name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {rowData.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {rowData.phone}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {rowData.country}
                  </p>

                  {/* Driving License */}
                  {rowData.driving_license &&
                    rowData?.type == "self_riding" && (
                      <div className="mt-3">
                        <p className="font-medium mb-2">Driving License:</p>
                        <Image
                          src={rowData.driving_license}
                          alt="Driving License"
                          className="rounded border"
                          width={200}
                          height={120}
                          style={{ objectFit: "cover" }}
                          fallback="https://via.placeholder.com/200x120?text=License"
                        />
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3">Booking Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Rental Type</p>
                  <Tag
                    color={rowData.type === "self_riding" ? "cyan" : "green"}
                  >
                    {rowData.type === "self_riding"
                      ? "Self Riding"
                      : "With Driver"}
                  </Tag>
                </div>

                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold">{rowData.start_date}</p>
                </div>

                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">End Date</p>
                  <p className="font-semibold">{rowData.end_date}</p>
                </div>

                <div className="bg-yellow-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold">
                    {calculateDuration(rowData.start_date, rowData.end_date)}{" "}
                    Days
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded col-span-2">
                  <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                  <p className="font-bold text-green-600 text-xl">
                    {rowData.price_currency || "$"}
                    {rowData.total_amount}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm mb-2">
                <span className="font-medium">Current Status:</span>
              </p>
              <Tag
                color={
                  rowData.status === "accepted"
                    ? "green"
                    : rowData.status === "rejected"
                    ? "red"
                    : "orange"
                }
                className="text-base px-4 py-1"
              >
                {rowData.status?.toUpperCase()}
              </Tag>
            </div>

            {/* Status Update Actions */}
            {rowData?.status == "pending" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Update Status</h3>
                <div className="flex gap-3">
                  <Button
                    type="primary"
                    className="bg-green-500 hover:bg-green-600 border-0"
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "accepted")
                    }
                    disabled={rowData.status?.toLowerCase() === "accepted"}
                    size="large"
                  >
                    ✓ Accept
                  </Button>
                  <Button
                    type="primary"
                    danger
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "rejected")
                    }
                    disabled={rowData.status?.toLowerCase() === "rejected"}
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
    </>
  );
};

export default CarsRequests;
