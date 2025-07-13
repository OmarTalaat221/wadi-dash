import React, { useEffect } from "react";
import { IoMdClose } from "react-icons/io";

function Modal({ open, setOpen, title, footer, children }) {
  useEffect(() => {
    const modalContainer = document.querySelector(".sw-modal-container");
    if (modalContainer) {
      if (open) {
        modalContainer.classList.add("active");
      } else {
        modalContainer.classList.remove("active");
      }
    }
  }, [open]);

  return (
    <div className="sw-modal-container">
      <div
        className="sw-modal-overlay"
        onClick={() => setOpen && setOpen(false)}
      ></div>
      <div className={open ? "sw-modal active" : "sw-modal"}>
        <div className="flex justify-between items-center w-full">
          <div className="sw-modal-header flex justify-between items-center w-full">
            <span>{title}</span>
            <span
              className="cursor-pointer inline-block"
              onClick={() => setOpen(false)}
            >
              <IoMdClose />
            </span>
          </div>
        </div>
        <div className="sw-modal-body">{children}</div>
        {footer ? <div className="sw-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Modal;
