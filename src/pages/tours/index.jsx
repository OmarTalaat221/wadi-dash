// pages/Tours.jsx
import React, { useState } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import ToursTableData from "../../components/tours-page/tour-table-data";
import ImportToursExcel from "../../components/tours-page/import-excel-modal";
import ConfirmDeleteTour from "../../components/tours-page/confirm-delete";
import TourBreadcrumbsButtons from "../../components/tours-page/tour-breadcrumbs-buttons";

function Tours() {
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTable = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col">
      <BreadCrumbs
        title="Dashboard / Home / Tours"
        children={
          <TourBreadcrumbsButtons
            setOpenImport={setOpenImport}
            // refreshTable={refreshTable}
          />
        }
      />
      <ToursTableData
        setOpenDelete={setOpenDelete}
        refreshTrigger={refreshTrigger}
      />
      <ImportToursExcel open={openImport} setOpen={setOpenImport} />
      <ConfirmDeleteTour
        open={openDelete}
        setOpen={setOpenDelete}
        refreshTable={refreshTable}
      />
    </div>
  );
}

export default Tours;
