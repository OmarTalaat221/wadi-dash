import React, { useState } from "react";
import WebsiteLogoEditor from "../../components/website-information/logo";
import SocialMediaEditor from "../../components/website-information/social-media-editor";
import ContactEditor from "../../components/website-information/contact-editor";
import GeneralSettingsEditor from "../../components/website-information/general-information-editor";
import BannersEditor from "../../components/Banners/banner";

function BannersLayout({ data }) {
  const [tabs, setTabs] = useState([
    {
      id: 0,
      title: "Home",
      component: <BannersEditor type={"home"} data={data?.home}/>,
    },
    {
      id: 1,
      title: "About",
      component: <BannersEditor type={"about"} data={data?.about}/>,
    },
    {
      id: 2,
      title: "Buy",
      component: <BannersEditor type={"buy"} data={data?.buy}/>,
    },
    {
      id: 3,
      title: "Rent",
      component: <BannersEditor type={"rent"} data={data?.rent}/>,
    },
    {
      id: 4,
      title: "List With Us",
      component: <BannersEditor type={"list"} data={data?.list}/>,
    },
    {
      id: 5,
      title: "Contact",
      component: <BannersEditor type={"contact"} data={data?.contact}/>,
    },
    {
      id: 6,
      title: "Commercial",
      component: <BannersEditor type={"commercial"} data={data?.commercial}/>,
    },
  ]);
  const [activeTab, setActiveTab] = useState(3);

  return (
    <div className="flex flex-col w-full">
      <div className="mb-4">
        <nav className="flex space-x-4 border-b pb-2">
          {tabs.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`px-4 py-2 ${
                activeTab === tab?.id
                  ? "border-b-2 border-blue-500 font-bold"
                  : "text-gray-500"
              }`}
            >
              {tab?.title}
            </button>
          ))}
        </nav>
      </div>
      {tabs?.filter((item) => item?.id == activeTab)[0]?.component}
    </div>
  );
}

export default BannersLayout;
