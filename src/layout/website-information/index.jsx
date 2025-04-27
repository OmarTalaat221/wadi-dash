import React, { useState } from "react";
import WebsiteLogoEditor from "../../components/website-information/logo";
import SocialMediaEditor from "../../components/website-information/social-media-editor";
import ContactEditor from "../../components/website-information/contact-editor";
import GeneralSettingsEditor from "../../components/website-information/general-information-editor";

function WebsiteInformationLayout() {
  const [tabs, setTabs] = useState([
    {
      id: 3,
      title: "General Information",
      component: <GeneralSettingsEditor />,
    },{
      id: 0,
      title: "Logo",
      component: <WebsiteLogoEditor />,
    },
    {
      id: 1,
      title: "Social Media",
      component: <SocialMediaEditor />,
    },
    {
      id: 2,
      title: "Contact",
      component: <ContactEditor />,
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

export default WebsiteInformationLayout;
