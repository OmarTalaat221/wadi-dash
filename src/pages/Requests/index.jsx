import React from "react";
import { Card, Col, Row } from "antd";
import { useSearchParams } from "react-router-dom";
import Tabs from "../../components/Tabs";
import ActivitiesRequests from "./components/ActivitiesRequests";
import CarsRequests from "./components/CarsRequests";
import AccommodationRequests from "./components/AccommodationRequests";
import TourRequests from "./components/TourRequests";

const TAB_OPTIONS = ["Tours", "Activities", "Cars", "Accommodation"];

const Requests = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const activeTab = TAB_OPTIONS.includes(tabFromUrl) ? tabFromUrl : "Tours";

  const handleTabChange = (tab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="tabled">
      <Row>
        <Col xs={24} xl={24} className="!w-full">
          <Card bordered={false} className="!w-full mb-24" title="Requests">
            <div>
              <Tabs
                tabs={TAB_OPTIONS}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                className="tabs-class"
                classNameDecoration="decoration-class"
              />

              {activeTab === "Tours" && <TourRequests />}
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
