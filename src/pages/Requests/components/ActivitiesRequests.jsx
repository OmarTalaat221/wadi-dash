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
  Divider,
  Radio,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
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
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [manualFilter, setManualFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [manualUpdateRecord, setManualUpdateRecord] = useState(null);

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

  // Filter data based on status and manual
  useEffect(() => {
    let filtered = data;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === statusFilter
      );
    }

    if (manualFilter !== "all") {
      filtered = filtered.filter((item) => item.manual === manualFilter);
    }

    setFilteredData(filtered);
  }, [statusFilter, manualFilter, data]);

  // Update status - Automatic (Accept/Reject)
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
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === "success") {
        message.success(
          `Status updated to ${status === "accepted" ? "upcoming" : status}`
        );
        fetchActivitiesRequests();
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

  // Manual status update
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
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === "success") {
        message.success(`Status manually updated to ${selectedStatus}`);
        fetchActivitiesRequests();
        setIsManualModalVisible(false);
        setSelectedStatus("");
        setManualUpdateRecord(null);
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

  // Open manual update modal
  const openManualUpdateModal = (record) => {
    setManualUpdateRecord(record);
    setSelectedStatus(record.status || "");
    setIsManualModalVisible(true);
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
      render: (text, record) => (
        <div className="flex flex-col gap-1">
          <Tag
            color={getStatusColor(text)}
            className="px-3 py-1 text-sm font-medium w-fit"
          >
            {text?.toUpperCase()}
          </Tag>
          {record.manual === "1" && (
            <Tooltip title="Manually Updated">
              <Tag
                color="gold"
                className="flex items-center gap-1 justify-center w-fit"
              >
                <ToolOutlined />
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
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <Button
            className="bg-primary text-white"
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
            className="!w-full mb-24"
            title="Activities Requests"
            extra={
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Status:</span>
                <Select
                  value={statusFilter}
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
                  value={manualFilter}
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {rowData && (
          <div className="space-y-4">
            {/* Status Badge */}
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

            {/* Status Update Actions - Only for pending */}
            {rowData?.status === "pending" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Update Status</h3>
                <div className="flex gap-3">
                  <Button
                    type="primary"
                    className="bg-green-500 hover:bg-green-600"
                    icon={<CheckCircleOutlined />}
                    loading={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(rowData.reserving_id, "accepted")
                    }
                    size="large"
                  >
                    Accept
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
                    Reject
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
                Activity: <strong>{manualUpdateRecord.title}</strong>
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
              className="w-full"
            >
              <div className="space-y-2">
                <Radio
                  value="upcoming"
                  className="w-full p-3 border rounded hover:bg-blue-50"
                >
                  <Tag color="blue">Upcoming</Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    - Activity is scheduled
                  </span>
                </Radio>
                <Radio
                  value="in_progress"
                  className="w-full p-3 border rounded hover:bg-cyan-50"
                >
                  <Tag color="cyan">In Progress</Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    - Activity is ongoing
                  </span>
                </Radio>
                <Radio
                  value="completed"
                  className="w-full p-3 border rounded hover:bg-purple-50"
                >
                  <Tag color="purple">Completed</Tag>
                  <span className="text-gray-500 text-xs ml-2">
                    - Activity finished
                  </span>
                </Radio>
                <Radio
                  value="rejected"
                  className="w-full p-3 border rounded hover:bg-red-50"
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
    </>
  );
};

export default ActivitiesRequests;
