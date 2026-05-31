import { useState } from "react";
import { Nav, Button, Offcanvas } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const MySidebar = ({ size, addClass }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const isActive = (path) => location.pathname === path;

  const goTo = (path, mobile = false) => {
    navigate(path);
    if (mobile) setShow(false);
  };

  const renderNavLinks = (isMobile = false) => (
    <Nav variant="pills" className="flex-column w-100 gap-1">
      <Nav.Item>
        <Button
          variant="transparent"
          className={`w-100 text-start border-0 rounded p-2 d-flex align-items-center custom-side-btn ${
            isActive("/") ? "fw-bold text-white" : "text-white-50"
          }`}
          style={isActive("/") ? { backgroundColor: "#a855f7", boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)" } : {}}
          onClick={() => goTo("/", isMobile)}
        >
          <i className="bi bi-house-door me-2"></i> Home
        </Button>
      </Nav.Item>

      <Nav.Item>
        <Button
          variant="transparent"
          className={`w-100 text-start border-0 rounded p-2 d-flex align-items-center custom-side-btn ${
            isActive("/esplora") ? "fw-bold text-white" : "text-white-50"
          }`}
          style={isActive("/esplora") ? { backgroundColor: "#a855f7", boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)" } : {}}
          onClick={() => goTo("/esplora", isMobile)}
        >
          <i className="bi bi-compass me-2"></i> Esplora Trend
        </Button>
      </Nav.Item>

      <Nav.Item>
        <Button
          variant="transparent"
          className={`w-100 text-start border-0 rounded p-2 d-flex align-items-center custom-side-btn ${
            isActive("/trackfolio") ? "fw-bold text-white" : "text-white-50"
          }`}
          style={isActive("/trackfolio") ? { backgroundColor: "#a855f7", boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)" } : {}}
          onClick={() => goTo("/trackfolio", isMobile)}
        >
          <i className="bi bi-collection-play me-2"></i> Il mio Trackfolio
        </Button>
      </Nav.Item>

      <Nav.Item>
        <Button
          variant="transparent"
          className={`w-100 text-start border-0 rounded p-2 d-flex align-items-center custom-side-btn ${
            isActive("/profilo") ? "fw-bold text-white" : "text-white-50"
          }`}
          style={isActive("/profilo") ? { backgroundColor: "#a855f7", boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)" } : {}}
          onClick={() => goTo("/profilo", isMobile)}
        >
          <i className="bi bi-person me-2"></i> Il mio Profilo
        </Button>
      </Nav.Item>

      <hr style={{ borderColor: "#232936", margin: "10px 0" }} />

      <Nav.Item>
        <Button
          variant="transparent"
          className={`w-100 text-start border-0 rounded p-2 d-flex align-items-center custom-side-btn ${
            isActive("/games") ? "fw-bold text-white" : "text-white-50"
          }`}
          style={isActive("/games") ? { backgroundColor: "#a855f7", boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)" } : {}}
          onClick={() => goTo("/games", isMobile)}
        >
          <i className="bi bi-controller me-2"></i> Esplora Giochi
        </Button>
      </Nav.Item>

      <Nav.Item>
        <Button
          variant="transparent"
          className={`w-100 text-start border-0 rounded p-2 d-flex align-items-center custom-side-btn ${
            isActive("/my-games") ? "fw-bold text-white" : "text-white-50"
          }`}
          style={isActive("/my-games") ? { backgroundColor: "#a855f7", boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)" } : {}}
          onClick={() => goTo("/my-games", isMobile)}
        >
          <i className="bi bi-folder-symlink me-2"></i> I miei Giochi
        </Button>
      </Nav.Item>
    </Nav>
  );

  return (
    <>
      {/* MOBILE BUTTON */}
      <div className="d-md-none w-100 mb-2">
        <Button
          variant="transparent"
          onClick={handleShow}
          className="w-100 d-flex justify-content-between align-items-center p-3 text-white"
          style={{
            backgroundColor: "#12151c",
            border: "1px solid #232936",
            borderRadius: "8px",
          }}
        >
          <span className="fw-bold text-uppercase small text-white-50">Navigazione menu</span>
          <i className="bi bi-list fs-4" style={{ color: "#a855f7" }}></i>
        </Button>
      </div>

      {/* MOBILE OFFCANVAS */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        className="text-white d-md-none"
        style={{ width: "290px", backgroundColor: "#12151c", borderRight: "1px solid #232936" }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="text-white-50 fw-bold small">TRACKFOLIO MENU</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="pt-4">{renderNavLinks(true)}</Offcanvas.Body>
      </Offcanvas>

      {/* DESKTOP */}
      <div
        className={`rounded p-3 d-none d-md-flex flex-column ${addClass}`}
        style={{
          width: size,
          backgroundColor: "#12151c",
          border: "1px solid #232936",
        }}
      >
        {renderNavLinks(false)}
      </div>

      {/* HOVER */}
      <style>{`
        .custom-side-btn:hover {
          background-color: rgba(168, 85, 247, 0.1) !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
};

export default MySidebar;
