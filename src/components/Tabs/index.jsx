import React, { useRef, useLayoutEffect, useCallback } from "react";
import "../../sass/components/_tabs.scss";

function Tabs({
  tabs,
  activeTab,
  classNameDecoration,
  setActiveTab,
  className,
  newTabs = {},
}) {
  const activeIndex =
    tabs.indexOf(activeTab) !== -1 ? tabs.indexOf(activeTab) : 0;

  const tabsRef = useRef([]);
  const navRef = useRef(null);
  const decorationRef = useRef(null);

  const updateDecoration = useCallback(() => {
    const activeTabEl = tabsRef.current[activeIndex];
    const navEl = navRef.current;
    const decorationEl = decorationRef.current;

    if (!activeTabEl || !navEl || !decorationEl) return;

    const tabRect = activeTabEl.getBoundingClientRect();
    const navRect = navEl.getBoundingClientRect();

    const width = tabRect.width;
    const left = tabRect.left - navRect.left;

    decorationEl.style.width = `${width}px`;
    decorationEl.style.transform = `translateX(${left}px)`;
  }, [activeIndex]);

  useLayoutEffect(() => {
    let raf1;
    let raf2;

    const runUpdate = () => {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          updateDecoration();
        });
      });
    };

    runUpdate();

    const handleResize = () => runUpdate();
    window.addEventListener("resize", handleResize);

    let resizeObserver;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => runUpdate());

      if (navRef.current) resizeObserver.observe(navRef.current);
      tabsRef.current.forEach((el) => {
        if (el) resizeObserver.observe(el);
      });
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        runUpdate();
      });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [updateDecoration, tabs, activeTab]);

  return (
    <div className="wrapper">
      <div className="content">
        <div className="content__inner">
          <div className={`tabs ${className}`}>
            <div className="tabs__nav" ref={navRef}>
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
                    onClick={() => setActiveTab(tab)}
                  >
                    <span className="tabs__nav-label">{tab}</span>
                    {newTabs?.[tab] && <span className="tabs__nav-new-dot" />}
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
