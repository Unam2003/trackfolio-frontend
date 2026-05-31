import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Button, Badge, Alert } from "react-bootstrap";

// Helper per mappare le stringhe RAWG (se usate come fallback)
const mapPlatformToEnum = (rawgPlatformName) => {
  if (!rawgPlatformName) return "PC";
  const name = rawgPlatformName.toLowerCase();

  if (name.includes("playstation 5") || name.includes("ps5")) return "PLAYSTATION_5";
  if (name.includes("playstation 4") || name.includes("ps4")) return "PLAYSTATION_4";
  if (name.includes("xbox series") || name.includes("xbox-series")) return "XBOX_SERIES_X";
  if (name.includes("xbox one") || name.includes("xbox-one")) return "XBOX_ONE";
  if (name.includes("nintendo switch") || name.includes("switch")) return "NINTENDO_SWITCH";
  if (name.includes("android") || name.includes("ios") || name.includes("mobile")) return "MOBILE";
  if (name.includes("pc") || name.includes("windows") || name.includes("mac")) return "PC";

  return "RETRO_CONSOLE";
};

// Tutte le piattaforme previste dal tuo Enum nel backend Java
const ALL_BACKEND_PLATFORMS = ["PC", "PLAYSTATION_5", "PLAYSTATION_4", "XBOX_SERIES_X", "XBOX_ONE", "NINTENDO_SWITCH", "MOBILE", "RETRO_CONSOLE"];

// Helper per rendere l'Enum bello da leggere nella select
const formatPlatformEnum = (platformEnum) => {
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
      return "PC (Windows)";
    case "RETRO_CONSOLE":
      return "Console Retro";
    default:
      return platformEnum;
  }
};

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [savedGameId, setSavedGameId] = useState(null);
  const [gameStatus, setGameStatus] = useState("IN_LIST");
  const [selectedPlatform, setSelectedPlatform] = useState("PC");

  // Stato per gestire le ore giocate (inserite manualmente se l'API restituisce 0)
  const [customHours, setCustomHours] = useState(0);

  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const showNotification = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => {
      setToast({ show: false, message: "", variant });
    }, 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PLAYING":
        return (
          <Badge bg="info" text="dark" className="p-2 fs-6 w-100">
            <i className="bi bi-controller me-1"></i> In Corso
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge bg="success" className="p-2 fs-6 w-100">
            <i className="bi bi-check-circle-fill me-1"></i> Completato
          </Badge>
        );
      case "PLATINUM":
        return (
          <Badge bg="warning" text="dark" className="p-2 fs-6 w-100">
            <i className="bi bi-trophy-fill me-1"></i> Platino
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="p-2 fs-6 w-100">
            <i className="bi bi-bookmark-fill me-1"></i> In Lista
          </Badge>
        );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:3001/games/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Impossibile caricare i dettagli del gioco.");
      })
      .then((data) => {
        setGame(data);

        if (data.platforms && data.platforms.length > 0) {
          const firstPlat = mapPlatformToEnum(data.platforms[0].platform?.name || data.platforms[0].platform);
          setSelectedPlatform(firstPlat);
        } else if (data.platform) {
          setSelectedPlatform(data.platform);
        }

        return fetch(`http://localhost:3001/me/games/check?rawgId=${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
      })
      .then((res) => {
        if (!res.ok || res.status === 204) return null;
        return res.text().then((text) => (text ? JSON.parse(text) : null));
      })
      .then((status) => {
        if (status && status.savedGameId) {
          setIsSaved(true);
          setSavedGameId(status.savedGameId);
          setGameStatus(status.status || "IN_LIST");
          setCustomHours(status.hoursPlayed || 0);
          if (status.platform) {
            setSelectedPlatform(status.platform);
          }
        } else {
          setIsSaved(false);
          setSavedGameId(null);
          setGameStatus("IN_LIST");
          setCustomHours(0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Errore nel caricamento:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const decodeHtml = (html) => {
    if (!html) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const handleAddToTrackfolio = () => {
    const token = localStorage.getItem("token");
    setIsSaving(true);

    // se il gioco ha ore su RAWG usa quelle, altrimenti usa quelle inserite dall'utente
    const finalHours = game.playtime > 0 ? game.playtime : customHours;

    const savedGameBody = {
      title: game.name,
      rawgId: parseInt(game.id, 10),
      coverUrl: game.background_image || "",
      platform: selectedPlatform,
      rating: game.rating || 5,
      hoursPlayed: parseInt(finalHours, 10) || 0,
      status: gameStatus,
      metacritic: game.metacritic || null,
    };

    fetch("http://localhost:3001/me/games", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savedGameBody),
    })
      .then((res) => {
        if (res.status === 403 || res.status === 409) {
          setIsSaved(true);
          throw new Error("Gioco già presente nel tuo Trackfolio.");
        }
        if (!res.ok) throw new Error("Errore durante il salvataggio.");
        return res.json();
      })
      .then((data) => {
        setIsSaved(true);
        setSavedGameId(data.savedGameId || data.id);
        setIsSaving(false);
        showNotification("Gioco aggiunto con successo al tuo Trackfolio!", "success");
      })
      .catch((err) => {
        console.error(err);
        setIsSaving(false);
        showNotification(err.message, "danger");
      });
  };

  const handleUpdateGame = (payload) => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:3001/me/games/${savedGameId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore durante l'aggiornamento.");
        showNotification("Modifica salvata con successo!", "success");
      })
      .catch((err) => {
        console.error(err);
        showNotification("Impossibile aggiornare i dati.", "danger");
      });
  };

  const handleRemoveFromTrackfolio = () => {
    const token = localStorage.getItem("token");

    if (!savedGameId) {
      showNotification("Impossibile rimuovere: ID del gioco non trovato.", "danger");
      return;
    }

    fetch(`http://localhost:3001/me/games/${savedGameId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore durante la rimozione dal database.");
        setIsSaved(false);
        setSavedGameId(null);
        setGameStatus("IN_LIST");
        setCustomHours(0);
        showNotification("Gioco rimosso con successo da Trackfolio!", "warning");
      })
      .catch((err) => {
        console.error("Errore nella rimozione:", err);
        showNotification(err.message, "danger");
      });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center text-white" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" style={{ color: "#a855f7" }} />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center text-white">
        <Alert variant="danger" className="bg-dark text-danger border-danger">
          {error}
        </Alert>
        <Button variant="outline-light" onClick={() => navigate(-1)}>
          Torna Indietro
        </Button>
      </Container>
    );
  }

  return (
    <div className="text-white pb-5" style={{ position: "relative" }}>
      {toast.show && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 9999, minWidth: "320px", textAlign: "center" }}>
          <Alert
            variant={toast.variant}
            className="shadow-lg fw-bold border-0 text-white"
            style={{ backgroundColor: toast.variant === "success" ? "#10b981" : toast.variant === "warning" ? "#f59e0b" : "#ef4444" }}
          >
            {toast.message}
          </Alert>
        </div>
      )}

      <div
        className="position-relative d-flex align-items-end"
        style={{
          height: "45vh",
          backgroundImage: `linear-gradient(to bottom, rgba(18,21,28,0.4), #12151c), url(${game?.background_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <Container className="px-4 pb-4">
          <Button variant="dark" className="bg-opacity-50 border-secondary rounded-circle mb-3 px-2.5 py-1.5 custom-back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left fs-5"></i>
          </Button>
          <h1 className="display-4 fw-bold m-0" style={{ textShadow: "2px 2px 10px rgba(0,0,0,0.8)" }}>
            {game?.name}
          </h1>
        </Container>
      </div>

      <Container className="px-4 mt-4">
        <Row className="g-4">
          <Col xs={12} lg={8}>
            <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: "#12151c", border: "1px solid #232936" }}>
              <h5 className="fw-bold mb-3" style={{ color: "#c084fc" }}>
                Description
              </h5>
              <p className="text-white-50 lh-lg small m-0" style={{ whiteSpace: "pre-line" }}>
                {game?.description_raw
                  ? decodeHtml(game.description_raw)
                  : game?.description
                    ? decodeHtml(game.description.replace(/<[^>]*>/g, ""))
                    : "No description available for this title."}
              </p>
            </div>
          </Col>

          <Col xs={12} lg={4}>
            <div className="p-4 rounded-4" style={{ backgroundColor: "#12151c", border: "1px solid #232936" }}>
              <h5 className="fw-bold mb-4" style={{ color: "#c084fc" }}>
                Game Info
              </h5>

              <div className="mb-3">
                <span className="text-white-50 d-block small">Release Date</span>
                <span className="fw-semibold">{game?.released ? new Date(game.released).toLocaleDateString("it-IT") : "TBA"}</span>
              </div>

              <div className="mb-3">
                <span className="text-white-50 d-block small">RAWG Rating</span>
                <span className="fw-semibold text-warning">⭐ {game?.rating ? game.rating.toFixed(1) : "N/A"} / 5</span>
              </div>

              <div className="mb-3">
                <span className="text-white-50 d-block small">Metacritic Score</span>
                {game?.metacritic ? (
                  <span
                    className="fw-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: game.metacritic >= 75 ? "#00aa00" : game.metacritic >= 50 ? "#ffaa00" : "#ff0000",
                      color: "white",
                    }}
                  >
                    {game.metacritic}
                  </span>
                ) : (
                  <span className="text-muted small">N/A</span>
                )}
              </div>

              {/* GESTIONE ORE GIOCATE DINAMICHE */}
              <div className="mb-3">
                <span className="text-white-50 d-block small">Durata Gioco</span>
                {game?.playtime > 0 ? (
                  // se RAWG torna un valote maggiore di 0 allora lo salva
                  <span className="fw-semibold text-info">⏳ {game.playtime} ore (Stima RAWG)</span>
                ) : (
                  // Se RAWG torna 0 allora sceglie l'utente le ore da salvare
                  <div className="mt-1">
                    <label className="text-warning small d-block mb-1" style={{ fontSize: "0.75rem" }}>
                      ⚠️ Durata API non disponibile. Inserisci le tue ore:
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm bg-dark text-white border-secondary text-center"
                        style={{ width: "90px" }}
                        value={customHours}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setCustomHours(val);
                          if (isSaved) {
                            handleUpdateGame({ hoursPlayed: val });
                          }
                        }}
                      />
                      <span className="text-white-50 small">ore</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sezione Seleziona Piattaforma */}
              <div className="mb-3">
                <label className="text-white-50 small d-block mb-1">Seleziona Piattaforma</label>
                <select
                  className="form-select form-select-sm bg-dark text-white border-secondary"
                  value={selectedPlatform}
                  onChange={(e) => {
                    const newPlat = e.target.value;
                    setSelectedPlatform(newPlat);
                    if (isSaved) {
                      handleUpdateGame({ platform: newPlat });
                    }
                  }}
                >
                  {ALL_BACKEND_PLATFORMS.map((platEnum) => (
                    <option key={platEnum} value={platEnum}>
                      {formatPlatformEnum(platEnum)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sezione Stato di Avanzamento */}
              <div className="d-flex flex-column gap-3 w-100">
                <div className="mb-2">
                  <label className="text-white-50 small d-block mb-1">Stato di Avanzamento</label>
                  <select
                    className="form-select form-select-sm bg-dark text-white border-secondary"
                    value={gameStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setGameStatus(newStatus);
                      if (isSaved) {
                        handleUpdateGame({ status: newStatus });
                      }
                    }}
                  >
                    <option value="IN_LIST">In Lista (Da Giocare)</option>
                    <option value="PLAYING">In Corso (Sto Giocando)</option>
                    <option value="COMPLETED">Completato</option>
                    <option value="PLATINUM">Platinato 🏆</option>
                  </select>
                </div>

                {!isSaved ? (
                  <Button
                    className="w-100 py-2 border-0 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: "#a855f7", color: "white", borderRadius: "8px" }}
                    onClick={handleAddToTrackfolio}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Aggiungi alla Collezione
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <div className="w-100 mb-1 text-center">{getStatusBadge(gameStatus)}</div>

                    {!isConfirming ? (
                      <Button
                        variant="outline-danger"
                        className="w-100 fw-bold py-2 shadow-sm"
                        style={{ borderRadius: "8px" }}
                        onClick={() => setIsConfirming(true)}
                      >
                        <i className="bi bi-trash3 me-2"></i>Rimuovi dalla Collezione
                      </Button>
                    ) : (
                      <div className="d-flex align-items-center justify-content-between w-100 bg-dark p-2 rounded border border-danger">
                        <span className="text-danger small fw-bold px-2">Sicuro?</span>
                        <div className="d-flex gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            className="fw-bold px-3"
                            onClick={() => {
                              handleRemoveFromTrackfolio();
                              setIsConfirming(false);
                            }}
                          >
                            Sì
                          </Button>
                          <Button variant="outline-light" size="sm" onClick={() => setIsConfirming(false)}>
                            No
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default GameDetails;
