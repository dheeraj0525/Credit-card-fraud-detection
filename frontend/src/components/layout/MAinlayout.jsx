import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

function MainLayout({ children }) {
  return (
    <div className="app-container">

      <Sidebar />

      <div className="content">

        <Topbar />

        <main>
          {children}
        </main>

        <Footer />

      </div>

    </div>
  );
}

export default MainLayout;