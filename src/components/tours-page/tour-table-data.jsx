// components/tours/ToursTableData.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, message, Switch, Button, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { base_url } from "./../../utils/base_url";

function ToursTableData({ setOpenDelete, refreshTrigger }) {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
  const invitationCode = adminData?.invitation_code || "";

  const goToUpdate = (id) => navigate(`update/${id}`);
  const goToReviews = (id) => navigate(`reviews/${id}`);

  useEffect(() => {
    loadTours(pagination.current, pagination.pageSize);
  }, [refreshTrigger]);

  const loadTours = async (page = 1, pageSize = 10, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const response = await axios.get(
        `${base_url}/admin/tours/select_tour.php`,
        {
          params: {
            page: page,
            limit: pageSize,
          },
        }
      );

      if (response.data.status === "success") {
        setTours(response.data.message);

        // Update pagination from API response
        const paginationData = response.data.pagination;
        setPagination({
          current: paginationData.current_page,
          pageSize: paginationData.per_page,
          total: paginationData.total_records || response.data.message.length,
        });
      }
    } catch (error) {
      console.error("Error loading tours:", error);
      message.error("Failed to load tours");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    loadTours(newPagination.current, newPagination.pageSize);
  };

  const handleToggleVisibility = async (tourId, currentStatus) => {
    try {
      const res = await axios.post(`${base_url}/admin/tours/toggle_tour.php`, {
        id: tourId,
      });

      if (res.data.status === "success") {
        message.success(res.data.message);
        loadTours(pagination.current, pagination.pageSize, false);
      }
    } catch (error) {
      console.error("Error toggling tour:", error);
      message.error("Failed to update tour visibility");
    }
  };

  const copyToClipboard = (tourId) => {
    const link = `https://wady-way-s2yw.vercel.app/package/package-details/${tourId}?tour-invite-code=${invitationCode}`;
    navigator.clipboard.writeText(link);
    message.success("Link copied to clipboard!");
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
      title: "Image",
      key: "image",
      width: 120,
      render: (_, record) => (
        <img
          className="w-[100px] h-[60px] object-cover rounded-md"
          src={record?.image || ""}
          alt={record?.title || ""}
        />
      ),
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
      title: "Country",
      dataIndex: "country_name",
      key: "country_name",
      sorter: (a, b) => a.country_name.localeCompare(b.country_name),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      sorter: (a, b) => a.duration.localeCompare(b.duration),
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <div className="text-center">
          <div className="font-bold text-green-600">
            {record.price_currency || "$"}
            {record.price_current}
          </div>
          {record.price_original &&
            record.price_original !== record.price_current && (
              <div className="text-sm text-gray-500 line-through">
                {record.price_currency || "$"}
                {record.price_original}
              </div>
            )}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Switch
          checked={record.hidden === "0"}
          onChange={() => handleToggleVisibility(record.id, record.hidden)}
          checkedChildren="Visible"
          unCheckedChildren="Hidden"
        />
      ),
    },
    {
      title: "Created",
      key: "created_at",
      render: (_, record) => (
        <div className="text-sm">
          {new Date(record.created_at).toLocaleDateString()}
        </div>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="flex gap-1 flex-wrap">
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
              size="small"
              type="primary"
              onClick={() => goToUpdate(record.id)}
            />
          </Tooltip>
          <Tooltip title="Reviews">
            <Button
              icon={<StarOutlined />}
              size="small"
              className="bg-amber-400 text-white border-amber-400 hover:bg-amber-500"
              onClick={() => goToReviews(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
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
        dataSource={tours}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} tours`,
          showQuickJumper: true,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}

export default ToursTableData;
