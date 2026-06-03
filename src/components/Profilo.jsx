import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Profilo = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [minutiSerie, setMinutiSerie] = useState(0);
  const [totaleEpisodi, setTotaleEpisodi] = useState(0);
  const [minutiFilm, setMinutiFilm] = useState(0);
  const [totaleFilm, setTotaleFilm] = useState(0);

  const [oreGaming, setOreGaming] = useState(0);
  const [totaleGiochi, setTotaleGiochi] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Devi fare login per vedere il profilo");
      setLoading(false);
      return;
    }

    // --- FETCH: DATI UTENTE ---
    fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore caricamento profilo");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // --- FETCH: MEDIA (FILM E SERIE) ---
    fetch(`${import.meta.env.VITE_API_URL}/me/media/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore recupero statistiche media");
        return res.json();
      })
      .then((stats) => {
        setMinutiSerie(stats.minutiSerie || 0);
        setTotaleEpisodi(stats.totaleEpisodi || 0);
        setMinutiFilm(stats.minutiFilm || 0);
        setTotaleFilm(stats.totaleFilm || 0);
      })
      .catch((err) => {
        console.error("Errore statistiche media:", err);
      });

    // --- FETCH: VIDEOGIOCHI ---
    fetch(`${import.meta.env.VITE_API_URL}/me/games`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore recupero collezione videogiochi");
        return res.json();
      })
      .then((gamesList) => {
        let oreTotali = 0;
        let conteggioGiochiAvviati = 0;

        for (let i = 0; i < gamesList.length; i++) {
          let gioco = gamesList[i];
          // Controllo classico dello stato del gioco
          if (gioco.status === "PLAYING" || gioco.status === "COMPLETED" || gioco.status === "PLATINUM") {
            oreTotali = oreTotali + (gioco.hoursPlayed || 0);
            conteggioGiochiAvviati = conteggioGiochiAvviati + 1;
          }
        }

        setOreGaming(oreTotali);
        setTotaleGiochi(conteggioGiochiAvviati);
      })
      .catch((err) => {
        console.error("Errore nel recupero dei giochi per il profilo:", err);
      });
  }, []);

  const convertiMinuti = (minutiTotali) => {
    const minutes = parseInt(minutiTotali, 10);
    if (!minutes || minutes === 0) return "0 ore";
    const oreTotali = Math.floor(minutes / 60);
    const ore = oreTotali % 24;
    const giorniTotali = Math.floor(oreTotali / 24);
    const giorni = giorniTotali % 30;
    const mesi = Math.floor(giorniTotali / 30);

    let pezzi = [];
    if (mesi > 0) pezzi.push(mesi + " mesi");
    if (giorni > 0) pezzi.push(giorni + " giorni");
    if (ore > 0 || pezzi.length > 0) {
      pezzi.push(ore + " ore");
    } else if (oreTotali === 0 && minutes > 0) {
      return minutes + " minuti";
    }
    return pezzi.length > 0 ? pezzi.join(", ") : "0 ore";
  };

  const getInitials = () => {
    if (!user) return "??";
    return ((user.name?.charAt(0) || "") + (user.surname?.charAt(0) || "")).toUpperCase();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5" style={{ minHeight: "30vh" }}>
        <Spinner animation="border" style={{ color: "#a855f7" }} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center fw-bold">
          {error || "Devi fare login"}
        </Alert>
        <div className="text-center mt-3">
          <Button variant="outline-light" onClick={() => navigate("/login")}>
            Vai al login
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-2 text-white">
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Button variant="dark" className="mb-3 custom-back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </Button>

          {/* CARD DATI UTENTE */}
          <Card
            className="text-white p-4 p-md-5 border-0 rounded-4 mb-4"
            style={{
              backgroundColor: "#12151c",
              border: "1px solid #232936",
              boxShadow: "0 4px 25px rgba(0,0,0,0.3)",
            }}
          >
            <Card.Body>
              <div className="d-flex flex-column flex-md-row align-items-center gap-4 border-bottom border-secondary border-opacity-25 pb-4 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                  style={{
                    width: "100px",
                    height: "100px",
                    fontSize: "2.5rem",
                    background: "linear-gradient(45deg, #a855f7, #c084fc)",
                    color: "white",
                  }}
                >
                  {getInitials()}
                </div>

                <div className="text-center text-md-start">
                  <h2 className="fw-bold mb-1">
                    {user.name} {user.surname}
                  </h2>
                  <p className="text-white-50 mb-0 small">Account Trackfolio</p>
                </div>
              </div>

              <h5 className="mb-4" style={{ color: "#c084fc" }}>
                Informazioni
              </h5>

              <Row className="g-3">
                <Col md={6}>
                  <div className="p-3 rounded" style={{ backgroundColor: "#1e2530" }}>
                    <small className="text-white-50">Nome</small>
                    <div>{user.name}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded" style={{ backgroundColor: "#1e2530" }}>
                    <small className="text-white-50">Cognome</small>
                    <div>{user.surname}</div>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="p-3 rounded" style={{ backgroundColor: "#1e2530" }}>
                    <small className="text-white-50">Email</small>
                    <div>{user.email}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* SEZIONE COMPLETA DELLE STATISTICHE - 3 COLONNE */}
          <Row className="g-3 mb-5">
            {/* SERIE TV */}
            <Col md={4}>
              <Card className="text-white p-3 border-0 rounded-4 h-100" style={{ backgroundColor: "#12151c", border: "1px solid #232936" }}>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-tv text-info fs-3 me-3"></i>
                      <h5 className="m-0 fw-bold">Serie TV & Anime</h5>
                    </div>
                    <div className="p-3 rounded mb-2" style={{ backgroundColor: "#1e2530" }}>
                      <small className="text-white-50 d-block">Tempo speso</small>
                      <strong className="fs-5 text-info">{convertiMinuti(minutiSerie)}</strong>
                    </div>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: "#1e2530" }}>
                    <small className="text-white-50 d-block">Totale episodi visti</small>
                    <strong className="fs-5">{totaleEpisodi}</strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* FILM */}
            <Col md={4}>
              <Card className="text-white p-3 border-0 rounded-4 h-100" style={{ backgroundColor: "#12151c", border: "1px solid #232936" }}>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-film text-warning fs-3 me-3"></i>
                      <h5 className="m-0 fw-bold">Film</h5>
                    </div>
                    <div className="p-3 rounded mb-2" style={{ backgroundColor: "#1e2530" }}>
                      <small className="text-white-50 d-block">Tempo speso</small>
                      <strong className="fs-5 text-warning">{convertiMinuti(minutiFilm)}</strong>
                    </div>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: "#1e2530" }}>
                    <small className="text-white-50 d-block">Totale film visti</small>
                    <strong className="fs-5">{totaleFilm}</strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* CARD VIDEOGIOCHI */}
            <Col md={4}>
              <Card className="text-white p-3 border-0 rounded-4 h-100" style={{ backgroundColor: "#12151c", border: "1px solid #232936" }}>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-controller fs-3 me-3" style={{ color: "#c084fc" }}></i>
                      <h5 className="m-0 fw-bold">Videogiochi</h5>
                    </div>
                    <div className="p-3 rounded mb-2" style={{ backgroundColor: "#1e2530" }}>
                      <small className="text-white-50 d-block">Tempo giocato</small>
                      <strong className="fs-5" style={{ color: "#c084fc" }}>
                        {oreGaming} ore
                      </strong>
                    </div>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: "#1e2530" }}>
                    <small className="text-white-50 d-block">Giochi avviati / finiti</small>
                    <strong className="fs-5">{totaleGiochi}</strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Profilo;
