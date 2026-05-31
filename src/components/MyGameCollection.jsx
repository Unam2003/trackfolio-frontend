import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MySidebar from "../components/MySidebar";

const formatPlatformEnum = (platformEnum) => {
  if (!platformEnum) return "N/A";

  switch (platformEnum) {
    case "PLAYSTATION_5":
      return "PlayStation 5";
    case "PLAYSTATION_4":
      return "PlayStation 4";
    case "XBOX_SERIES_X":
      return "Xbox Series X";
    case "XBOX_ONE":
      return "Xbox One";
    case "NINTENDO_SWITCH":
      return "Nintendo Switch";
    case "MOBILE":
      return "Mobile";
    case "PC":
      return "PC";
    case "RETRO_CONSOLE":
      return "Console Retro";
    default:
      return platformEnum.replace("_", " ");
  }
};

const MyGamesCollection = () => {
  const navigate = useNavigate();

  const [giochi, setGiochi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3001/me/games", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Errore nel recupero della collezione");
        }

        return res.json();
      })
      .then((data) => {
        const ordineStatus = {
          PLAYING: 1,
          IN_LIST: 2,
          COMPLETED: 3,
          PLATINUM: 4,
          DROPPED: 5,
        };

        const giochiOrdinati = [...data].sort((a, b) => {
          return ordineStatus[a.status] - ordineStatus[b.status];
        });

        setGiochi(giochiOrdinati);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrore("Errore durante il caricamento della collezione.");
        setLoading(false);
      });
  }, []);

  const giocoEAvviato = (status) => {
    return status === "PLAYING" || status === "COMPLETED" || status === "PLATINUM";
  };

  const calcolaOreTotali = () => {
    return giochi.reduce((acc, curr) => {
      if (giocoEAvviato(curr.status)) {
        return acc + (curr.hoursPlayed || 0);
      }

      return acc;
    }, 0);
  };

  const ottieniDettaglioOrePerPiattaforma = () => {
    const mappatura = {};

    giochi.forEach((gioco) => {
      if (gioco.hoursPlayed > 0 && giocoEAvviato(gioco.status)) {
        const platNome = formatPlatformEnum(gioco.platform);

        mappatura[platNome] = (mappatura[platNome] || 0) + gioco.hoursPlayed;
      }
    });

    return mappatura;
  };

  const orePerPiattaforma = ottieniDettaglioOrePerPiattaforma();
  const haDettagliOre = Object.keys(orePerPiattaforma).length > 0;

  const getStatusBadge = (status) => {
    const badges = {
      PLAYING: {
        bg: "info",
        icon: "bi-controller",
        text: "In Corso",
      },

      COMPLETED: {
        bg: "success",
        icon: "bi-check-circle-fill",
        text: "Completato",
      },

      PLATINUM: {
        bg: "warning",
        icon: "bi-trophy-fill",
        text: "Platino",
      },

      DROPPED: {
        bg: "danger",
        icon: "bi-x-circle",
        text: "Abbandonato",
      },
    };

    const config = badges[status] || {
      bg: "secondary",
      icon: "bi-bookmark-fill",
      text: "In Lista",
    };

    return (
      <Badge bg={config.bg} text={config.bg === "warning" ? "dark" : "white"}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="d-flex w-100 min-vh-100" style={{ backgroundColor: "#090a0f" }}>
      <Container fluid className="px-4 my-4">
        <Row className="align-items-start g-4">
          <Col xs={12} md={3} lg={2} className="sticky-md-top" style={{ top: "90px" }}>
            <MySidebar />
          </Col>

          <Col xs={12} md={9} lg={10} className="text-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
              <h2 className="fw-bold m-0">La Mia Collezione 🕹️</h2>

              {!loading && giochi.length > 0 && (
                <OverlayTrigger
                  placement="bottom"
                  disabled={!haDettagliOre}
                  overlay={
                    <Tooltip id="tooltip-ore" className="shadow">
                      <div className="text-start p-1">
                        <strong className="d-block border-bottom border-secondary pb-1 mb-1 small">Dettaglio ore giocate:</strong>

                        {Object.entries(orePerPiattaforma).map(([plat, ore]) => (
                          <div key={plat} className="small d-flex justify-content-between gap-3">
                            <span>{plat}:</span>

                            <span className="text-info fw-bold">{ore}h</span>
                          </div>
                        ))}
                      </div>
                    </Tooltip>
                  }
                >
                  <div
                    className="p-2 px-3 rounded-3 border border-secondary bg-dark bg-opacity-50 d-flex align-items-center gap-2 shadow-sm"
                    style={{
                      cursor: haDettagliOre ? "pointer" : "default",
                    }}
                  >
                    <i className="bi bi-clock-history text-info fs-5"></i>

                    <span>
                      Tempo giocato effettivo: <strong className="text-info">{calcolaOreTotali()} ore</strong>
                      {haDettagliOre && <i className="bi bi-info-circle ms-2 text-muted small" style={{ fontSize: "0.8rem" }}></i>}
                    </span>
                  </div>
                </OverlayTrigger>
              )}
            </div>

            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" style={{ color: "#a855f7" }} />
              </div>
            ) : errore ? (
              <div className="alert alert-danger bg-dark text-danger border-danger">{errore}</div>
            ) : giochi.length === 0 ? (
              <div
                className="text-center py-5 rounded"
                style={{
                  backgroundColor: "#12151c",
                  border: "1px solid #232936",
                }}
              >
                <i className="bi bi-controller fs-1 text-muted d-block mb-2"></i>

                <p className="text-white-50 m-0">Non hai ancora aggiunto nessun gioco al tuo Trackfolio.</p>
              </div>
            ) : (
              <Row xs={1} sm={2} md={2} lg={4} className="g-4">
                {giochi.map((item) => (
                  <Col key={item.savedGameId || item.id}>
                    <Card
                      className="h-100 border-0 text-white rounded shadow-lg"
                      style={{
                        backgroundColor: "#12151c",
                        border: "1px solid #232936",
                        cursor: "pointer",
                        transition: "transform 0.2s ease",
                      }}
                      onClick={() => navigate(`/details/game/${item.rawgId}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.03)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={item.coverUrl || "https://placehold.co/500x281?text=No+Image"}
                          style={{
                            height: "160px",
                            objectFit: "cover",
                          }}
                        />

                        <div
                          className="position-absolute"
                          style={{
                            top: "10px",
                            left: "10px",
                          }}
                        >
                          {getStatusBadge(item.status)}
                        </div>
                      </div>

                      <Card.Body>
                        <Card.Title className="fw-bold h6 text-truncate mb-2">{item.title}</Card.Title>

                        <Card.Text className="text-white-50 small mb-0">
                          Piattaforma: <span className="text-white">{formatPlatformEnum(item.platform)}</span>
                          <br />
                          Durata: <span className="text-info">⏳ {item.hoursPlayed ? `${item.hoursPlayed} ore` : "0 ore"}</span>
                          <br />
                          Voto: <span className="text-warning">⭐ {item.rating ? `${item.rating.toFixed(1)} / 5` : "N/A"}</span>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MyGamesCollection;
