import React from "react";
import { Navigate } from "react-router-dom";

// Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import Note from "../pages/Authentication/Note";
import Message from "../pages/Messages/Message";
import Finance from "../pages/Finance/Finance";
import Profile from "../pages/User/Profile";
import PublicChannel from "../pages/Public/PublicChannel";
import PreviewChannel from "../pages/Public/PreviewChannel";
import Api from "../pages/Apis/Api";
import QuantomApi from "../pages/Apis/Quantom";
import NotFound from "../pages/NotFound/NotFound";
import Tool from "../pages/Tools/tool";
import Settings from "../pages/Settings/Settings";
import UserHistory from "../pages/History/UserHistory";

const authProtectedRoutes = [
	// { path: "/dashboard", component: <Dashboard /> },
	{ path: "/messages", name:"Messages", component: <Message /> },
	{ path: "/profile", name:"Profile", component: <Profile /> },
	{ path: "/finance/*", name:"Finance", component: <Finance /> },
	{ path: "/tools/*", name:"Tools", component: <Tool /> },
	{ path: "/settings/*", name:"Settings", component: <Settings /> },
	{ path: "/history/:receiverId", name:"History", component: <UserHistory /> },

	// this route should be at the end of all other routes
	{ path: "/", exact: true, component: <Navigate to="/important-note" /> },
	{ path: "*", component: <NotFound /> },
];

const publicRoutes = [
	{ path: "/logout",  name:"Logout", component: <Logout /> },
	{ path: "/login", Name:"Login" ,component: <Login /> },
	{ path: "/register", name:"Register", component: <Register /> },
	{ path: "/important-note", name:"Important Note",component: <Note /> },
	{ path: "/swagger-apis", name:"Swagger Apis", component: <Api /> },
	{ path: "/quantomography-apis", name:"Swagger Apis", component: <QuantomApi /> },
	{ path: "/channel/:channelName", name:"Public Channel", component: <PublicChannel /> },
	{ path: "/channel-preview/:channelName", name:"Preview Channel", component: <PreviewChannel /> },
	{ path: "*", component: <NotFound /> },
];

export { authProtectedRoutes, publicRoutes };
