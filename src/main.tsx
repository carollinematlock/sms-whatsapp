import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import NewCommunicationRoute from "./routes/NewCommunication";
import InboxRoute from "./routes/Inbox";
import AllCommunicationsRoute from "./routes/AllCommunications";
import ReportingRoute from "./routes/Reporting";
import "./styles/tailwind.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <NewCommunicationRoute /> },
      { path: "inbox", element: <InboxRoute /> },
      { path: "communications", element: <AllCommunicationsRoute /> },
      { path: "reporting", element: <ReportingRoute /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
