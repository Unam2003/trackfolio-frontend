import { useEffect, useState } from "react";
import { Container, Button, Form, InputGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const MyNav = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogged = localStorage.getItem("utenteLoggato") === "true";
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!isLogged) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:3001/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Impossibile recuperare i dati utente nella navbar");
      })
      .then((data) => {
        if (data && (data.email || data.username)) {
          setUserEmail(data.email || data.username);
        }
      })
      .catch((err) => console.error("Errore fetch navbar:", err));
  }, [isLogged]);

  const handleLogout = function () {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // BLINDATURA AGGIORNATA: Consideriamo sezione giochi anche se siamo già nei risultati di ricerca giochi (?game=)
  const isGameSection =
    location.pathname.includes("/games") ||
    location.pathname.includes("/details/game") ||
    location.pathname.includes("/my-games") ||
    (location.pathname.includes("/search") && location.search.includes("game="));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (isGameSection) {
      navigate(`/search?game=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }

    // BLINDATURA INVIO: Toglie il focus dall'input per evitare invii multipli a vuoto
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  return (
    <nav
      className="navbar navbar-expand-md navbar-dark mb-4 sticky-top py-3"
      style={{
        backgroundColor: "#12151c",
        borderBottom: "1px solid #232936",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
      }}
    >
      <Container fluid className="px-4">
        <span
          className="navbar-brand fw-bold trackfolio-title"
          style={{
            fontFamily: "Georgia",
            fontSize: 26,
            cursor: "pointer",
            color: "#a855f7",
            textShadow: "0 0 10px rgba(168, 85, 247, 0.3)",
          }}
          onClick={() => navigate(isLogged ? "/" : "/login")}
        >
          TRACKFOLIO
        </span>

        {isLogged && (
          <div className="d-flex flex-grow-1 justify-content-between align-items-center ms-4">
            <Form onSubmit={handleSearchSubmit} className="mx-auto" style={{ width: "100%", maxWidth: "450px" }}>
              <InputGroup className="align-items-center px-3 rounded-pill" style={{ backgroundColor: "#1e2530", border: "1px solid #3b4252" }}>
                <InputGroup.Text className="bg-transparent border-0 text-white-50 p-0 pe-2">
                  <i className="bi bi-search" style={{ color: "#a855f7" }}></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={isGameSection ? "Cerca un videogioco..." : "Cerca film, serie tv, anime..."}
                  className="bg-transparent border-0 text-white py-2 shadow-none custom-nav-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: "0.95rem" }}
                />
              </InputGroup>

              <style>{`
                .custom-nav-search::placeholder {
                  color: rgba(255, 255, 255, 0.75) !important;
                  opacity: 1 !important;
                }
                .custom-nav-search:focus {
                  color: #fff !important;
                }
              `}</style>
            </Form>

            <div className="d-flex align-items-center gap-3">
              {userEmail && (
                <div
                  className="d-none d-sm-flex align-items-center gap-2 px-3 py-1.5 rounded-pill"
                  style={{
                    backgroundColor: "#1e2530",
                    border: "1px solid #232936",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/profilo")}
                >
                  <i className="bi bi-envelope-at shadow-sm" style={{ color: "#c084fc" }}></i>
                  <span className="text-white-50 small fw-medium">{userEmail}</span>
                </div>
              )}

              <Button variant="outline-danger" size="sm" className="px-3 fw-semibold" style={{ borderRadius: "6px" }} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        )}

        {!isLogged && (
          <div className="ms-auto d-flex align-items-center gap-2">
            <Button variant="transparent" className="text-white-50 fw-semibold btn-sm px-3" onClick={() => navigate("/login")}>
              Accedi
            </Button>
            <Button className="fw-bold btn-sm px-3 text-white rounded border-0" style={{ backgroundColor: "#a855f7" }} onClick={() => navigate("/register")}>
              Registrati
            </Button>
          </div>
        )}
      </Container>
    </nav>
  );
};

export default MyNav;
