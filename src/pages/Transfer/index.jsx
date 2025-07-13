import React, { useState } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import { accom } from "../../data/accom";
import TransferBreadcrumbsButtons from "../../components/Transfer/transfer-breadcrumbs-buttons";
import TransferTableData from "../../components/Transfer/transfer-table-data";
import ConfirmDeleteTransfer from "../../components/Transfer/confirm-delete";
import { transfers } from "../../data/transfer";
import ImportTransferExcel from "../../components/Transfer/import-excel-modal";

function Transfer() {
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="flex flex-col">
      <BreadCrumbs
        title={"Dashboard / Home / Transfer"}
        children={
          <>
            <TransferBreadcrumbsButtons
              setOpenImport={setOpenImport}
              accom={accom}
            />
          </>
        }
      />
      <TransferTableData setOpenDelete={setOpenDelete} transfer={transfers} />
      <ImportTransferExcel open={openImport} setOpen={setOpenImport} />
      <ConfirmDeleteTransfer open={openDelete} setOpen={setOpenDelete} />
    </div>
  );
}

export default Transfer;
