import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button, Empty, ColorPicker, Tooltip } from "antd";
import { FiSearch, FiX, FiCheck } from "react-icons/fi";
// import { ICON_LIBRARY } from "../../../shared/constants/iconLibrary";
import { ICON_LIBRARY } from "./iconLibrary";

const PRIMARY_COLOR = "#295557";

const IconSelector = ({ value, onChange, placeholder = "Select an icon" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const extractDetails = (val) => {
    if (!val) return { svg: "", color: PRIMARY_COLOR };

    const colorMatch = val.match(/style="color:\s*(#[a-fA-F0-9]+)"/);
    const svgMatch = val.match(/<svg.*<\/svg>/);

    return {
      svg: svgMatch ? svgMatch[0] : val,
      color: colorMatch ? colorMatch[1] : PRIMARY_COLOR,
    };
  };

  const initialDetails = useMemo(() => extractDetails(value), [value]);
  const [selectedSvg, setSelectedSvg] = useState(initialDetails.svg);
  const [selectedColor, setSelectedColor] = useState(initialDetails.color);

  useEffect(() => {
    const details = extractDetails(value);
    setSelectedSvg(details.svg);
    setSelectedColor(details.color);
  }, [value]);

  const filteredIcons = useMemo(() => {
    const search = (searchTerm || "").toLowerCase().trim();
    if (!search) return ICON_LIBRARY;
    return ICON_LIBRARY.filter(
      (icon) => icon.name && icon.name.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  const wrapSvg = (svg, color) => {
    if (!svg) return "";
    return `<span style="color: ${color}">${svg}</span>`;
  };

  const handleSelect = (svg) => {
    setSelectedSvg(svg);
    onChange(wrapSvg(svg, selectedColor));
    setIsModalOpen(false);
  };

  const handleColorChange = (color) => {
    const hex = color.toHexString();
    setSelectedColor(hex);
    if (selectedSvg) {
      onChange(wrapSvg(selectedSvg, hex));
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedSvg("");
    onChange("");
  };

  return (
    <div className="icon-selector-wrapper">
      <div className="flex items-stretch gap-3">
        {/* Main Selector Box */}
        <div
          className="flex-1 flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-[#295557]/30 hover:bg-[#295557]/5 transition-all duration-300 group relative bg-white shadow-sm hover:shadow-md"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Icon Preview */}
          <div
            className="w-12 h-12 flex items-center justify-center bg-gray-50 group-hover:bg-white rounded-xl border border-gray-100 group-hover:border-[#295557]/20 transition-colors shadow-inner"
            style={{
              backgroundColor: selectedSvg ? `${selectedColor}10` : undefined,
            }}
          >
            {selectedSvg ? (
              <div
                className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center"
                style={{ color: selectedColor }}
                dangerouslySetInnerHTML={{ __html: selectedSvg }}
              />
            ) : (
              <div className="w-7 h-7 border-2 border-dashed border-gray-200 rounded-lg group-hover:border-[#295557]/30 transition-colors" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            {selectedSvg ? (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  Icon Selected
                </span>
                <span
                  className="text-xs font-medium opacity-80 uppercase tracking-wider"
                  style={{ color: PRIMARY_COLOR }}
                >
                  Custom color applied
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">
                {placeholder}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {selectedSvg && (
              <Tooltip title="Remove Selection">
                <button
                  onClick={clearSelection}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors border border-red-50"
                >
                  <FiX size={16} />
                </button>
              </Tooltip>
            )}
            <div
              className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-white transition-all border border-gray-100"
              style={{
                backgroundColor: selectedSvg ? PRIMARY_COLOR : undefined,
                color: selectedSvg ? "white" : undefined,
              }}
            >
              <FiSearch
                size={14}
                className="group-hover:scale-110 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div
          className="flex flex-col gap-1 items-center justify-center px-3 rounded-2xl border"
          style={{
            backgroundColor: `${PRIMARY_COLOR}08`,
            borderColor: `${PRIMARY_COLOR}20`,
          }}
        >
          <ColorPicker
            value={selectedColor}
            onChange={handleColorChange}
            size="large"
          />
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ color: PRIMARY_COLOR }}
          >
            Color
          </span>
        </div>
      </div>

      {/* Icon Selection Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <FiSearch size={20} />
            </div>
            <div>
              <div className="text-base font-bold text-gray-800 leading-tight">
                Icon Library
              </div>
              <div className="text-xs font-medium text-gray-400">
                Search over 250+ premium icons
              </div>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        centered
        className="premium-icon-modal"
      >
        {/* Search Input */}
        <div className="mb-6 sticky top-0 bg-white/80 backdrop-blur-md pt-2 z-10 -mx-6 px-6 pb-4 border-b border-gray-50 text-left">
          <div className="relative">
            <input
              placeholder="Search by name (e.g., 'home', 'user', 'cart')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl h-12 border-2 border-gray-100 hover:border-[#295557]/30 focus:border-[#295557] transition-all bg-gray-50/30 w-full pl-10 pr-4 outline-none"
            />
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: PRIMARY_COLOR }}
            >
              <FiSearch size={18} />
            </div>
          </div>
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[450px] overflow-y-auto p-2 scroll-smooth-custom">
          {filteredIcons.length > 0 ? (
            filteredIcons.map((icon, idx) => (
              <div
                key={idx}
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                  selectedSvg === icon.svg
                    ? "shadow-sm"
                    : "border-transparent hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm"
                }`}
                style={{
                  borderColor:
                    selectedSvg === icon.svg ? PRIMARY_COLOR : undefined,
                  backgroundColor:
                    selectedSvg === icon.svg ? `${PRIMARY_COLOR}10` : undefined,
                }}
                onClick={() => handleSelect(icon.svg)}
                title={icon.name}
              >
                {/* Selected Checkmark */}
                {selectedSvg === icon.svg && (
                  <div
                    className="absolute top-1.5 right-1.5 w-5 h-5 text-white rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-300"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    <FiCheck size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-8 h-8 transition-transform duration-300 group-hover:scale-125 flex items-center justify-center"
                  style={{
                    color: selectedSvg === icon.svg ? selectedColor : "#64748b",
                  }}
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />

                {/* Icon Name */}
                <span
                  className={`text-[11px] mt-2 font-medium truncate w-full text-center px-1 ${
                    selectedSvg === icon.svg ? "" : "text-gray-400"
                  }`}
                  style={{
                    color: selectedSvg === icon.svg ? PRIMARY_COLOR : undefined,
                  }}
                >
                  {icon.name}
                </span>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <p className="text-gray-500 font-semibold mb-1">
                      No icons found
                    </p>
                    <p className="text-gray-400 text-xs">
                      Try searching with different keywords
                    </p>
                  </div>
                }
              />
              <Button
                type="default"
                // ghost
                onClick={() => setSearchTerm("")}
                className="mt-4 rounded-lg text-[#fff] hover:text-[#295557] hover:bg-transparent "
                // style={{
                //   borderColor: PRIMARY_COLOR,
                //   color: PRIMARY_COLOR,
                // }}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Styles */}
      <style jsx global>{`
        .premium-icon-modal .ant-modal-content {
          border-radius: 24px;
          padding: 0;
          overflow: hidden;
        }
        .premium-icon-modal .ant-modal-header {
          padding: 24px 24px 16px;
          border-bottom: none;
          margin-bottom: 0;
        }
        .premium-icon-modal .ant-modal-body {
          padding: 0 24px 24px;
        }
        .premium-icon-modal .ant-modal-close {
          top: 24px;
          right: 24px;
          background: #f8fafc;
          border-radius: 12px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .premium-icon-modal .ant-modal-close:hover {
          background: #fee2e2;
          color: #ef4444;
        }
        .scroll-smooth-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scroll-smooth-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll-smooth-custom::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .scroll-smooth-custom::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .premium-icon-modal .ant-btn-primary {
          background-color: ${PRIMARY_COLOR};
          border-color: ${PRIMARY_COLOR};
        }
        .premium-icon-modal .ant-btn-primary:hover {
          background-color: ${PRIMARY_COLOR}dd;
          border-color: ${PRIMARY_COLOR}dd;
        }
      `}</style>
    </div>
  );
};

export default IconSelector;
