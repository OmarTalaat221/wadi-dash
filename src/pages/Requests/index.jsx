import React, { useState } from "react";
import { Card, Col, Row } from "antd";
import Tabs from "../../components/Tabs";
import ActivitiesRequests from "./components/ActivitiesRequests";
import CarsRequests from "./components/CarsRequests";
import AccommodationRequests from "./components/AccommodationRequests";

const Requests = () => {
  const [activeTab, setActiveTab] = useState("Activities");

  return (
    <div className="tabled">
      <Row className="">
        <Col xs="24" xl={24} className="!w-full">
          <Card bordered={false} className="!w-full mb-24" title="Requests">
            <div className="">
              <Tabs
                tabs={["Activities", "Cars", "Accommodation"]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                className="tabs-class"
                classNameDecoration="decoration-class"
              />
              {activeTab === "Activities" && <ActivitiesRequests />}
              {activeTab === "Cars" && <CarsRequests />}
              {activeTab === "Accommodation" && <AccommodationRequests />}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Requests;
