import React, { useState, useRef, useEffect } from "react";
import "../../sass/components/_tabs.scss";

function Tabs({
  tabs,
  activeTab,
  classNameDecoration,
  setActiveTab,
  className,
}) {
  // ✅ activeIndex مشتق من activeTab prop مش state مستقل
  const activeIndex =
    tabs.indexOf(activeTab) !== -1 ? tabs.indexOf(activeTab) : 0;

  const tabsRef = useRef([]);
  const decorationRef = useRef(null);

  useEffect(() => {
    const updateDecoration = () => {
      const activeTabEl = tabsRef.current[activeIndex];
      if (activeTabEl && decorationRef.current) {
        decorationRef.current.style.width = `${activeTabEl.offsetWidth}px`;
        decorationRef.current.style.transform = `translateX(${activeTabEl.offsetLeft}px)`;
      }
    };

    updateDecoration();
    window.addEventListener("resize", updateDecoration);
    return () => window.removeEventListener("resize", updateDecoration);
  }, [activeIndex]);

  return (
    <div className="wrapper">
      <div className="content">
        <div className="content__inner">
          <div className={`tabs ${className}`}>
            <div className="tabs__nav">
              <div
                className={`tabs__nav-decoration ${classNameDecoration}`}
                ref={decorationRef}
              />
              <ul className="tabs__nav-list">
                {tabs.map((tab, index) => (
                  <li
                    key={tab}
                    ref={(el) => (tabsRef.current[index] = el)}
                    className={`tabs__nav-item ${
                      activeIndex === index ? "js-active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab(tab);
                    }}
                  >
                    {tab}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tabs;
