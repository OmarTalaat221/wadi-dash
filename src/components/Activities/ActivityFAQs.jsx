// src/components/Activities/ActivityFAQs.jsx
import React, { useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaGripVertical,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

function ActivityFAQs({ rowData, setRowData }) {
  // ✅ Changed from single value to Set for multiple open
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());

  const faqs = rowData.faqsArray || [];

  const updateFAQs = (newFAQs) => {
    const faqsString = convertFAQsToString(newFAQs);
    setRowData((prev) => ({
      ...prev,
      faqsArray: newFAQs,
      faqsString: faqsString,
    }));
  };

  const convertFAQsToString = (faqsList) => {
    if (!faqsList || faqsList.length === 0) return "";
    return faqsList
      .filter((f) => f.question || f.answer)
      .map((f) => {
        const question = (f.question || "").trim();
        const answer = (f.answer || "").trim();
        return `${question}**${answer}`;
      })
      .join("**CAMP**");
  };

  // ✅ Toggle: add/remove from Set
  const toggleExpand = (id) => {
    setExpandedFAQs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ✅ Check if expanded
  const isExpanded = (id) => expandedFAQs.has(id);

  // ✅ Expand all / Collapse all
  const expandAll = () => {
    setExpandedFAQs(new Set(faqs.map((f) => f.id)));
  };

  const collapseAll = () => {
    setExpandedFAQs(new Set());
  };

  const addFAQ = () => {
    const newFAQ = {
      id: Date.now(),
      question: "",
      answer: "",
    };
    const updated = [...faqs, newFAQ];
    updateFAQs(updated);
    // ✅ Auto-expand new FAQ
    setExpandedFAQs((prev) => new Set(prev).add(newFAQ.id));
  };

  const removeFAQ = (id) => {
    const updated = faqs.filter((f) => f.id !== id);
    updateFAQs(updated);
    // ✅ Remove from expanded set
    setExpandedFAQs((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const updateFAQField = (id, field, value) => {
    const updated = faqs.map((f) =>
      f.id === id ? { ...f, [field]: value } : f
    );
    updateFAQs(updated);
  };

  const moveFAQUp = (index) => {
    if (index === 0) return;
    const updated = [...faqs];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updateFAQs(updated);
  };

  const moveFAQDown = (index) => {
    if (index === faqs.length - 1) return;
    const updated = [...faqs];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updateFAQs(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add common questions and answers about this activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* ✅ Expand All / Collapse All */}
          {faqs.length > 1 && (
            <button
              type="button"
              onClick={
                expandedFAQs.size === faqs.length ? collapseAll : expandAll
              }
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#295557] px-3 py-2 rounded-lg border border-gray-200 hover:border-[#295557] transition-colors duration-200"
            >
              {expandedFAQs.size === faqs.length ? (
                <>
                  <FaChevronUp size={10} />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <FaChevronDown size={10} />
                  <span>Expand All</span>
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={addFAQ}
            className="flex items-center gap-2 bg-[#295557] text-white px-4 py-2 rounded-lg hover:bg-[#1e3e40] transition-colors duration-200"
          >
            <FaPlus size={12} />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {/* FAQ Count */}
      {faqs.length > 0 && (
        <div className="text-sm text-gray-500">
          {faqs.length} FAQ{faqs.length !== 1 ? "s" : ""} added
          {expandedFAQs.size > 0 && (
            <span className="ml-1">· {expandedFAQs.size} expanded</span>
          )}
        </div>
      )}

      {/* Empty State */}
      {faqs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h4 className="text-gray-600 font-medium mb-1">No FAQs Added</h4>
          <p className="text-gray-400 text-sm mb-4">
            Add frequently asked questions to help customers
          </p>
          <button
            type="button"
            onClick={addFAQ}
            className="flex items-center gap-2 bg-[#295557] text-white px-4 py-2 rounded-lg hover:bg-[#1e3e40] transition-colors duration-200"
          >
            <FaPlus size={12} />
            <span>Add First FAQ</span>
          </button>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const expanded = isExpanded(faq.id);

          return (
            <div
              key={faq.id}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                expanded
                  ? "border-[#295557] shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* FAQ Header */}
              <div
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors duration-200 ${
                  expanded ? "bg-[#295557]/5" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => toggleExpand(faq.id)}
              >
                <div className="flex items-center gap-2">
                  <FaGripVertical className="text-gray-300" size={14} />
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#295557] text-white text-xs font-bold">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {faq.question || "Untitled Question"}
                  </p>
                  {!expanded && faq.answer && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {faq.answer}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveFAQUp(index);
                    }}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <FaChevronUp size={10} className="text-gray-500" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveFAQDown(index);
                    }}
                    disabled={index === faqs.length - 1}
                    className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <FaChevronDown size={10} className="text-gray-500" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFAQ(faq.id);
                    }}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-1"
                    title="Delete FAQ"
                  >
                    <FaTrash size={12} />
                  </button>
                  <div className="ml-1">
                    {expanded ? (
                      <FaChevronUp size={12} className="text-[#295557]" />
                    ) : (
                      <FaChevronDown size={12} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* FAQ Body - ✅ Now multiple can be open */}
              {expanded && (
                <div className="p-4 pt-2 bg-white border-t border-gray-100 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={faq.question || ""}
                      onChange={(e) =>
                        updateFAQField(faq.id, "question", e.target.value)
                      }
                      placeholder="e.g., What should I bring?"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Answer *
                    </label>
                    <textarea
                      value={faq.answer || ""}
                      onChange={(e) =>
                        updateFAQField(faq.id, "answer", e.target.value)
                      }
                      placeholder="Write the answer here..."
                      rows={4}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557] outline-none transition-all resize-y"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add More Button */}
      {faqs.length > 0 && (
        <button
          type="button"
          onClick={addFAQ}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-[#295557] hover:border-[#295557] transition-colors duration-200"
        >
          <FaPlus size={12} />
          <span className="text-sm font-medium">Add Another FAQ</span>
        </button>
      )}
    </div>
  );
}

export default ActivityFAQs;
