import React from "react";
import WebsiteInformationLayout from "../../layout/website-information";
import BreadCrumbs from "../../components/bread-crumbs";

function WebsiteInformation() {
  return (
    <div className="flex flex-col gap-2.5">
      <BreadCrumbs title={"Dashboard / Home / Website Information"} children={<></>} />{" "}
      <WebsiteInformationLayout />
    </div>
  );
}

export default WebsiteInformation;
