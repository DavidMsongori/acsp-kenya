import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Navbar />

      <main className="public-main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;