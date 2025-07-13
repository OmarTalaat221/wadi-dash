import React, { useState } from "react";
import { Button, Card, Col, Row } from "antd";
import DataTable from "../../layout/DataTable";
import UserTripDetails from './components/userTripDetails';

const UsersRequests = () => {
  const loading = false;
  const [rowData , setRowData] = useState(null);

  const headers = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => (
        <div>
          <p>{text}</p>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text) => (
        <div>
          <p className="text-gray-500">{text}</p>
        </div>
      ),
    },
    {
      title: "Current Balance",
      dataIndex: "currentBalance",
      render: (text) => (
        <div>
          <p className="text-green-500 font-bold text-2xl">${text}</p>
        </div>
      ),
    },
    {
      title: "Trip Price become",
      dataIndex: "currentBalance",
      render: (text) => (
        <p className="text-gray-500  text-base">
          From <span className="text-black font-bold text-xl">$500</span>{" "}
          To <span className="text-green-400 font-bold text-2xl">$530</span>
        </p>
      ),
    },
    {
      title: "Transition",
      dataIndex: "currentBalance",
      render: (text) => (
        <div className="flex flex-col">
          <p className="font-bold text-blue-600">In Day 3</p>
          <p className="">from hotel x to z</p>
        </div>
      ),
    },
    {
      title: "Tour Details",
      dataIndex: "tourDetails",
      render: (text) => (
        <div>
          <Button

            className="bg-primary text-white"
            type="primary"
            onClick={() => {
              setRowData(text);
              setIsModalOpen(true);
            }}
          >
            View Tour Details
          </Button>
        </div>
      ),
    },
  ];

  const data = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main St, Anytown, USA",
      city: "Anytown",
      state: "CA",
      currentBalance: "600",
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="tabled">
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <Card
            bordered={false}
            className="!w-full  mb-24"
            title="Chefs"
            // extra={
            //   <>
            //     <Radio.Group onChange={onChange} defaultValue='a'>
            //       <Radio.Button value='a'>All</Radio.Button>
            //       <Radio.Button value='b'>Today</Radio.Button>
            //     </Radio.Group>
            //   </>
            // }
          >
            <div className="">
              <DataTable
                loading={loading}
                addBtn={false}
                searchPlaceholder={"Search for Chefs"}
                table={{ header: headers, rows: data }}
                bordered={true}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <UserTripDetails
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        rowData={rowData}
      />
    </div>
  );
};

export default UsersRequests;
