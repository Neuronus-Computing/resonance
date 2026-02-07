import { isMobile, isTablet, isDesktop } from "react-device-detect";

export const detectDeviceType = () => {
    if (isMobile) {
        return "mobile";
    } else if (isTablet) {
        return "tablet";
    } else if (isDesktop) {
        return "desktop";
    }
};

export const toggleContentVisibility = (deviceType, action) => {
    const leftsidebar = document.querySelector("#leftbar");
    const verticleMenu = document.querySelector("#verticleMenu");
    const pageContent = document.querySelector(".page-content");
    const pageContentInside = document.querySelector(".page-content .right-msg.container");
    const content = document.querySelector("#content");

    if (!leftsidebar || !content) return;

    if (deviceType === "mobile") {
        if (action === "hide") {
            leftsidebar.style.display = "block";
            verticleMenu.style.display = "block";
            pageContent.style.paddingLeft = "0px";
            content.style.display = "none";
            pageContentInside.style.width = "100%";
            pageContentInside.style.marginLeft = "0px";
        } else if (action === "show") {
            leftsidebar.style.display = "none";
            verticleMenu.style.display = "none";
            pageContent.style.paddingLeft = "0px";
            content.style.display = "block";
            content.style.setProperty("height", "100vh", "important");
            pageContentInside.style.marginLeft = "0px";
        }
    } else if (deviceType === "tablet") {
        leftsidebar.style.display = "block";
        verticleMenu.style.display = "block";
        content.style.setProperty("height", "100vh", "important");
        pageContent.style.paddingLeft = "20px";
        pageContentInside.style.width = "91%";
        pageContentInside.style.marginLeft = "70px";
        content.style.display = "block";
    } else if (deviceType != "desktop") {
        // Desktop
        leftsidebar.style.display = "block";
        verticleMenu.style.display = "block";
        pageContent.style.paddingLeft = "14px";
        pageContentInside.style.width = "91%";
        pageContentInside.style.marginLeft = "70px";
        content.style.display = "block";
    }
};
export const getMenuSettings = () => {
    const s = this.props.user?.identity?.settings || {};

    return {
        sidebarItems: s.menuSidebarItems || {
            messages: true,
            finance: true,
            settings: true,
            tools: true, // ✅ include tools in defaults
        },
        applicationToolId: s.menuApplicationSlotToolId || "",
    };
};

export const getSelectedApplicationTool = () => {
    const { applicationToolId } = this.getMenuSettings();
    const tools = this.props.menu?.tools || [];
    if (!applicationToolId) return null;
    return tools.find(t => String(t.id) === String(applicationToolId)) || null;
}
