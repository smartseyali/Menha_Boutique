"use client"
import React, { useEffect, useState } from 'react'

const Tools = () => {
    const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedColor, setSelectedColor] = useState("primary");
    const [isRTL, setIsRTL] = useState(false);
    const [isBox, setIsBox] = useState(true);

    // dark mode
    useEffect(() => {
        const darkStyleTag = document.getElementById("add_dark");

        if (isDarkMode && !darkStyleTag) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "/assets/css/dark.css";
            link.id = "add_dark";
            document.head.appendChild(link);
        } else if (!isDarkMode && darkStyleTag) {
            darkStyleTag.remove();
        }
    }, [isDarkMode]);

    // rtl mode
    useEffect(() => {
        const rtlStyleTag = document.getElementById("add_rtl");

        if (isRTL && !rtlStyleTag) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "/assets/css/rtl.css";
            link.id = "add_rtl";
            document.head.appendChild(link);
        } else if (!isRTL && rtlStyleTag) {
            rtlStyleTag.remove();
        }
    }, [isRTL]);

    //  box-1
    useEffect(() => {
        const boxStyleTag = document.getElementById("add_box");
        if (isBox && !boxStyleTag) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "/assets/css/box-1.css";
            link.id = "add_box";
            document.head.appendChild(link);
        } else if (!isBox && boxStyleTag) {
            boxStyleTag.remove();
        }
    }, [isBox]);

    // color
    useEffect(() => {
        const colorStyleTag = document.getElementById("add_class");
        if (colorStyleTag) {
            colorStyleTag.remove();
        }
        if (selectedColor && selectedColor !== "primary") {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = `/assets/css/${selectedColor}.css`;
            link.id = "add_class";
            document.head.appendChild(link);
        }
    }, [selectedColor])


    const handleDarkModeToggle = (theme: any) => {
        setIsDarkMode(theme === "dark");
    };

    const handleRTLModeToggle = (direction: any) => {
        setIsRTL(direction === "rtl");
    };

    const handleBoxToggle = (box: any) => {
        setIsBox(box === "box-1")
    }

    const handleColorSelect = (colorClass: any) => {
        setSelectedColor(colorClass)
    }

    const openToolsManu = () => {
        setIsToolsMenuOpen(true)
    }
    const closeToolsManu = () => {
        setIsToolsMenuOpen(false)
    }
    return (
        <>
            <div onClick={closeToolsManu} style={{ display: isToolsMenuOpen ? "block" : "none" }} className="bb-tools-sidebar-overlay"></div>
            <div className={`bb-tools-sidebar ${isToolsMenuOpen ? "open-tools" : ""}`}>
                <a onClick={openToolsManu} style={{ display: isToolsMenuOpen ? "none" : "" }} className="bb-tools-sidebar-toggle in-out">
                    <i className="ri-settings-fill"></i>
                </a>
                <div className="bb-bar-title">
                    <h6>Tools</h6>
                    <a onClick={closeToolsManu} className="close-tools"><i className="ri-close-line"></i></a>
                </div>
                <div className="bb-tools-detail">
                    <div className="bb-tools-block">
                        <h3>Select Color</h3>
                        <ul className="bb-color">

                            <li onClick={() => handleColorSelect("primary")} className={`color-primary ${selectedColor === "primary" ? "active-variant" : ""}`}></li>
                            {Array.from({ length: 9 }).map((_, index) => {
                                const colorClass = `color-${index + 1}`;

                                return (
                                    <li onClick={() => handleColorSelect(colorClass)} key={colorClass} className={`${colorClass} ${selectedColor === colorClass ? "active-variant" : ""}`}></li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="bb-tools-block">
                        <h3>Dark Modes</h3>
                        <div className="bb-tools-dark">
                            <div onClick={() => handleDarkModeToggle("light")} className={`mode-primary bb-dark-item mode light ${!isDarkMode ? "active-dark" : ""}`} data-bb-mode-tool="light">
                                <img src="/assets/img/tools/light.png" alt="light" />
                                <p>Light</p>
                            </div>
                            <div onClick={() => handleDarkModeToggle("dark")} className={`bb-dark-item mode dark ${isDarkMode ? "active-dark" : ""}`} data-bb-mode-tool="dark">
                                <img src="/assets/img/tools/dark.png" alt="dark" />
                                <p>Dark</p>
                            </div>
                        </div>
                    </div>
                    <div className="bb-tools-block">
                        <h3>RTL Modes</h3>
                        <div className="bb-tools-rtl">
                            <div onClick={() => handleRTLModeToggle("ltr")} className={`bb-tools-item ltr ${!isRTL ? "active-rtl" : ""}`} data-bb-mode-tool="ltr">
                                <img src="/assets/img/tools/ltr.png" alt="ltr" />
                                <p>LTR</p>
                            </div>
                            <div onClick={() => handleRTLModeToggle("rtl")} className={`bb-tools-item rtl ${isRTL ? "active-rtl" : ""}`} data-bb-mode-tool="rtl">
                                <img src="/assets/img/tools/rtl.png" alt="rtl" />
                                <p>RTL</p>
                            </div>
                        </div>
                    </div>
                    <div className="bb-tools-block">
                        <h3>Box Design</h3>
                        <div className="bb-tools-box">
                            <div onClick={() => handleBoxToggle("default")} className={`bb-tools-item default ${!isBox ? "active-box" : ""}`} data-bb-mode-tool="default">
                                <img src="/assets/img/tools/box-0.png" alt="box-0" />
                                <p>Default</p>
                            </div>
                            <div onClick={() => handleBoxToggle("box-1")} className={`bb-tools-item box-1 ${isBox ? "active-box" : ""}`} data-bb-mode-tool="box-1">
                                <img src="/assets/img/tools/box-1.png" alt="box-1" />
                                <p>Box-1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Tools
