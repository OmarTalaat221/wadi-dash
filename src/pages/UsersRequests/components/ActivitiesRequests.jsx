import React, { useState } from "react";
import { Button, Card, Col, Row } from "antd";
import DataTable from "../../../layout/DataTable";

const ActivitiesRequests = () => {
  const loading = false;
  const [rowData, setRowData] = useState(null);

  const headers = [
    {
      title: "Activity Name",
      dataIndex: "name",
      render: (text) => (
        <div>
          <p>{text}</p>
        </div>
      ),
    },
    {
      title: "User Email",
      dataIndex: "email",
      render: (text) => (
        <div>
          <p className="text-gray-500">{text}</p>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => (
        <div>
          <p>{text}</p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <div>
          <p
            className={`font-bold ${
              text === "Approved"
                ? "text-green-500"
                : text === "Pending"
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {text}
          </p>
        </div>
      ),
    },
    {
      title: "Details",
      dataIndex: "details",
      render: (text) => (
        <div>
          <Button
            className="bg-primary text-white"
            type="primary"
            onClick={() => {
              setRowData(text);
              // Handle modal open if needed
            }}
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const data = [
    {
      name: "Hiking in Mountains",
      email: "user1@example.com",
      date: "2023-10-01",
      status: "Approved",
      details: "Hiking request details",
    },
    {
      name: "City Tour",
      email: "user2@example.com",
      date: "2023-10-02",
      status: "Pending",
      details: "City tour request details",
    },
  ];

  return (
    <Row className="">
      <Col xs="24" xl={24} className="!w-full">
        <Card
          bordered={false}
          className="!w-full mb-24"
          title="Activities Requests"
        >
          <div className="">
            <DataTable
              loading={loading}
              addBtn={false}
              searchPlaceholder={"Search for Activities Requests"}
              table={{ header: headers, rows: data }}
              bordered={true}
              onSearchChabnge={() => {}}
              onAddClick={() => {}}
              btnText=""
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ActivitiesRequests;
