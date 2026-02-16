// components/Car/car-table-data.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, Switch, Button, message, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, CopyOutlined } from "@ant-design/icons";

function CarTableData({
  setOpenDelete,
  cars,
  onToggle,
  isLoading,
  pagination,
  onPaginationChange,
}) {
  const navigate = useNavigate();
  const goToUpdate = (id) => navigate(`update/${id}`);

  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
  const invitationCode = adminData?.invitation_code || "";

  const copyToClipboard = (carId) => {
    const link = `http://wady-way-s2yw.vercel.app/transport/transport-details?id=${carId}&transport-invite-code=${invitationCode}`;
    navigator.clipboard.writeText(link);
    message.success("Link copied to clipboard!");
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    if (onPaginationChange) {
      onPaginationChange(newPagination.current, newPagination.pageSize);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Main Image",
      key: "image",
      width: 140,
      render: (_, record) => {
        const imageUrl = record?.image?.split("//CAMP//")[0] || "";
        return (
          <img
            className="w-[120px] h-[120px] object-cover rounded-md"
            src={imageUrl}
            alt={record.title}
          />
        );
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      filterSearch: true,
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Subtitle",
      dataIndex: "subtitle",
      key: "subtitle",
      filterSearch: true,
      onFilter: (value, record) =>
        record.subtitle?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Car Type",
      dataIndex: "car_type",
      key: "car_type",
      sorter: (a, b) => a.car_type.localeCompare(b.car_type),
      filterSearch: true,
      onFilter: (value, record) =>
        record.car_type.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-green-600">
            {record.price_currency || "$"}
            {record.price_current}
          </span>
          {record.price_original && (
            <span className="text-sm line-through text-gray-500">
              {record.price_currency || "$"}
              {record.price_original}
            </span>
          )}
          {record.price_note && (
            <span className="text-xs text-gray-600">{record.price_note}</span>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isHidden = record.hidden === "1" || record.hidden === 1;
        return (
          <Switch
            checked={!isHidden}
            onChange={() => onToggle(record.id)}
            loading={isLoading}
            checkedChildren="Visible"
            unCheckedChildren="Hidden"
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <div className="flex gap-1">
          <Tooltip title="Copy Link">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => copyToClipboard(record.id)}
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              type="primary"
              size="small"
              onClick={() => goToUpdate(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              onClick={() => setOpenDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="TableData">
      <Table
        columns={columns}
        dataSource={cars}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 10,
          total: pagination?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} cars`,
          showQuickJumper: true,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}

export default CarTableData;
