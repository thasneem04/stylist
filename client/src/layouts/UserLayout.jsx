import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="grow pt-28 md:pt-16 pb-24 md:pb-0">
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
};

export default UserLayout;
