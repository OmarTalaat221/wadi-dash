import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row, Modal, Select, message, Tag } from "antd";
import DataTable from "../../../layout/DataTable";
import axios from "axios";
import { base_url } from "../../../utils/base_url";

const { Option } = Select;

const ActivitiesRequests = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchActivitiesRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/activities/select_activities_requests.php`
      );

      if (response.data?.status === "success") {
        setData(response.data?.message);
        setFilteredData(response.data?.message);
      } else {
        message.error("Failed to fetch activities requests");
      }
    } catch (error) {
      console.error("Error fetching activities requests:", error);
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesRequests();
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
        `${base_url}/admin/activities/update_status.php`,
        {
          reserving_id,
          status,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === "success") {
        message.success(`Status updated to ${status}`);
        fetchActivitiesRequests(); // Refresh data
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

  const headers = [
    {
      title: "Activity Name",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <p className="font-semibold">{text}</p>
          <p className="text-xs text-gray-500">{record.subtitle}</p>
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
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => (
        <div>
          <p>{text}</p>
        </div>
      ),
    },
    {
      title: "Participants",
      dataIndex: "adults_num",
      key: "participants",
      render: (text, record) => (
        <div>
          <p>Adults: {record.adults_num}</p>
          <p>Children: {record.childs_num}</p>
        </div>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text, record) => (
        <div>
          <p className="font-bold text-green-600">
            {record.price_currency}
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
            title="Activities Requests"
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
                searchPlaceholder={"Search for Activities Requests"}
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
        title="Activity Request Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {rowData && (
          <div className="space-y-4">
            {/* Activity Image */}
            <div className="flex justify-center">
              <img
                src={rowData.image?.split("//CAMP//")[0]}
                alt={rowData.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Activity Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Activity Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Title:</span> {rowData.title}
                  </p>
                  <p>
                    <span className="font-medium">Subtitle:</span>{" "}
                    {rowData.subtitle}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {rowData.activity_type}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {rowData.duration}
                  </p>
                  <p>
                    <span className="font-medium">Route:</span> {rowData.route}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span>{" "}
                    {rowData.price_currency}
                    {rowData.price_current}{" "}
                    <span className="line-through text-gray-400">
                      {rowData.price_currency}
                      {rowData.price_original}
                    </span>{" "}
                    <span className="text-xs text-gray-500">
                      {rowData.price_note}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
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
                  <p>
                    <span className="font-medium">Age:</span> {rowData.age}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-medium">Date:</span> {rowData.date}
                </p>
                <p>
                  <span className="font-medium">Adults:</span>{" "}
                  {rowData.adults_num}
                </p>
                <p>
                  <span className="font-medium">Children:</span>{" "}
                  {rowData.childs_num}
                </p>
                <p>
                  <span className="font-medium">Total Amount:</span>{" "}
                  <span className="text-green-600 font-bold">
                    {rowData.price_currency}
                    {rowData.total_amount}
                  </span>
                </p>
              </div>
            </div>

            {/* Status Update Actions */}
            {rowData?.status == "pending" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Update Status</h3>
                <div className="flex gap-3">
                  <Button
                    type="primary"
                    className="bg-green-500 hover:bg-green-600"
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "accepted")
                    }
                    disabled={rowData.status?.toLowerCase() === "accepted"}
                  >
                    Accept
                  </Button>
                  <Button
                    type="primary"
                    danger
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "rejected")
                    }
                    disabled={rowData.status?.toLowerCase() === "rejected"}
                  >
                    Reject
                  </Button>
                  <Button onClick={() => setIsModalVisible(false)}>
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

export default ActivitiesRequests;
