import React from "react";
import { Card, Col, Row } from "antd";
import { useSearchParams } from "react-router-dom";
import Tabs from "../../components/Tabs";
import ActivitiesRequests from "./components/ActivitiesRequests";
import CarsRequests from "./components/CarsRequests";
import AccommodationRequests from "./components/AccommodationRequests";
import TourRequests from "./components/TourRequests";
import { useReadStatus } from "../../context/ReadStatusContext";

const TAB_OPTIONS = ["Tours", "Activities", "Cars", "Accommodation"];

const Requests = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasNewByType, fetchReadFlags } = useReadStatus();

  const tabFromUrl = searchParams.get("tab");
  const activeTab = TAB_OPTIONS.includes(tabFromUrl) ? tabFromUrl : "Tours";

  const handleTabChange = (tab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams, { replace: true });
  };

  // ✅ 0 = new
  const newTabs = {
    Tours: hasNewByType("tour"),
    Activities: hasNewByType("activity"),
    Cars: hasNewByType("car"),
    Accommodation: hasNewByType("hotel"),
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
                newTabs={newTabs} // ✅ نفس التابس بس مع dot
              />

              {activeTab === "Tours" && (
                <TourRequests onReadUpdated={fetchReadFlags} />
              )}
              {activeTab === "Activities" && (
                <ActivitiesRequests onReadUpdated={fetchReadFlags} />
              )}
              {activeTab === "Cars" && (
                <CarsRequests onReadUpdated={fetchReadFlags} />
              )}
              {activeTab === "Accommodation" && (
                <AccommodationRequests onReadUpdated={fetchReadFlags} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Requests;
