import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import MySidebar from "./MySidebar";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Recupero iniziale dei media
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3001/me/media", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel recupero dati.");
        return res.json();
      })
      .then((data) => {
        setAllMedia(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossibile caricare dati, errore di rete o server.");
        setLoading(false);
      });
  }, []);

  // Incremento dell'episodio
  const handleNextEpisode = (tmdbId, currentSeason, nextEpisode) => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:3001/tv_series/watch?tmdbId=${tmdbId}&season=${currentSeason}&episode=${nextEpisode}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Impossibile aggiornare l'episodio.");
        return res.json();
      })
      .then((updatedMedia) => {
        // Aggiorna l'elemento nella lista senza ricaricare la pagina
        setAllMedia((prevList) => prevList.map((item) => (item.tmdbId === tmdbId ? updatedMedia : item)));
      })
      .catch((err) => {
        console.error(err);
        alert("Errore durante l'aggiornamento dell'episodio.");
      });
  };

  // --- MEDIA STATUS ---

  // 1. IN CORSO
  const watchingTV = allMedia.filter(
    (item) =>
      (item.type === "TV_SERIES" || item.type === "ANIME" || item.mediaType === "tv" || item.mediaType === "anime") &&
      item.lastEpisodeWatched > 0 &&
      item.status !== "COMPLETED" &&
      item.status !== 2,
  );

  // 2. DA INIZIARE
  const planToWatchTV = allMedia.filter(
    (item) =>
      (item.type === "TV_SERIES" || item.type === "ANIME" || item.mediaType === "tv" || item.mediaType === "anime") &&
      (!item.lastEpisodeWatched || item.lastEpisodeWatched === 0) &&
      item.status !== "COMPLETED" &&
      item.status !== 2,
  );

  // 3. FILM
  const watchListMovies = allMedia.filter((item) => (item.type === "MOVIE" || item.mediaType === "movie") && item.status !== "COMPLETED" && item.status !== 2);

  const hasActiveMedia = watchingTV.length > 0 || planToWatchTV.length > 0 || watchListMovies.length > 0;

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "scale(1.03)";
  };
  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <div className="w-100 min-vh-100" style={{ backgroundColor: "#090a0f" }}>
      <Container fluid className="px-5 my-4">
        <Row className="justify-content-center align-items-start g-4">
          {/* SIDEBAR */}
          <Col xs={12} md={3} lg={2}>
            <MySidebar />
          </Col>

          {/* CONTENUTO PRINCIPALE */}
          <Col xs={12} md={9} lg={10} className="text-white">
            <div className="mb-4">
              <h3 className="fw-bold mb-1 text-white">Trackfolio Dashboard</h3>
              <p className="text-white-50 small">Il resoconto completo dei tuoi tracciamenti</p>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" style={{ color: "#a855f7" }} />
              </div>
            ) : error ? (
              <Alert variant="danger" className="bg-dark text-danger border-danger">
                {error}
              </Alert>
            ) : !hasActiveMedia ? (
              <div className="p-5 text-center rounded" style={{ backgroundColor: "#12151c", border: "1px solid #232936" }}>
                <i className="bi bi-collection-play fs-1 text-secondary mb-3 d-block"></i>
                <h5 className="fw-bold">La tua lista è vuota</h5>
                <p className="text-white-50 small">Non hai serie in corso o film da vedere. Esplora nuovi contenuti!</p>
                <Button onClick={() => navigate("/esplora")} className="mt-2 border-0 fw-semibold" style={{ backgroundColor: "#a855f7" }}>
                  Esplora i Trend
                </Button>
              </div>
            ) : (
              <>
                {/* ================= 1. IN CORSO ================= */}
                {watchingTV.length > 0 && (
                  <div className="mb-5">
                    <h5 className="fw-bold mb-3 ps-2 border-start border-3 d-flex align-items-center gap-2" style={{ borderColor: "#a855f7" }}>
                      In Corso <Badge style={{ backgroundColor: "#a855f7", fontSize: "0.75rem" }}>{watchingTV.length}</Badge>
                    </h5>
                    <Row className="g-4">
                      {watchingTV.map((media) => {
                        const season = media.lastSeasonWatched || 1;
                        const lastEp = media.lastEpisodeWatched || 0;
                        const mediaType = (media.type || media.mediaType || "").toLowerCase();

                        return (
                          <Col key={`watching-${media.tmdbId}`} xs={12} sm={6} md={4} lg={3}>
                            <Card
                              style={{ backgroundColor: "#12151c", border: "1px solid #232936", transition: "transform 0.2s ease" }}
                              className="text-white h-100"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                            >
                              <div
                                className="position-relative"
                                onClick={() => navigate(`/details/${mediaType === "anime" ? "anime" : "tv"}/${media.tmdbId}`)}
                                style={{ cursor: "pointer" }}
                              >
                                <Card.Img
                                  variant="top"
                                  src={media.posterPath ? `https://image.tmdb.org/t/p/w500${media.posterPath}` : "https://placehold.co/500x281?text=No+Poster"}
                                  style={{ objectFit: "cover", height: "160px" }}
                                />
                                <span
                                  className="position-absolute top-0 end-0 text-white px-2 py-1 small fw-bold rounded-start m-2"
                                  style={{ backgroundColor: "#a855f7", fontSize: "0.7rem" }}
                                >
                                  S{season}
                                </span>
                              </div>
                              <Card.Body className="p-3 d-flex flex-column justify-content-between">
                                <div className="mb-2">
                                  <Card.Title className="h6 fw-bold text-truncate m-0">{media.title || media.name}</Card.Title>
                                  <p className="text-white-50 small m-0 mt-1">
                                    Visto:{" "}
                                    <span className="text-white">
                                      Stagione {season} - Ep. {lastEp}
                                    </span>
                                  </p>
                                </div>
                                <Button
                                  variant="outline-light"
                                  className="w-100 btn-sm fw-semibold mt-2 py-2"
                                  style={{ borderColor: "#3b4252" }}
                                  onClick={() => handleNextEpisode(media.tmdbId, season, lastEp + 1)}
                                >
                                  <i className="bi bi-play-fill" style={{ color: "#a855f7" }}></i> Ep. {lastEp + 1} Visto
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                )}

                {/* ================= 2. DA INIZIARE ================= */}
                {planToWatchTV.length > 0 && (
                  <div className="mb-5">
                    <h5 className="fw-bold mb-3 ps-2 border-start border-3 border-info d-flex align-items-center gap-2">
                      Da Iniziare{" "}
                      <Badge bg="secondary" style={{ fontSize: "0.75rem" }}>
                        {planToWatchTV.length}
                      </Badge>
                    </h5>
                    <Row className="g-4">
                      {planToWatchTV.map((media) => {
                        const mediaType = (media.type || media.mediaType || "").toLowerCase();

                        return (
                          <Col key={`plan-${media.tmdbId}`} xs={12} sm={6} md={4} lg={3}>
                            <Card
                              style={{ backgroundColor: "#12151c", border: "1px solid #232936", opacity: 0.9, transition: "transform 0.2s ease" }}
                              className="text-white h-100"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                            >
                              <div onClick={() => navigate(`/details/${mediaType === "anime" ? "anime" : "tv"}/${media.tmdbId}`)} style={{ cursor: "pointer" }}>
                                <Card.Img
                                  variant="top"
                                  src={media.posterPath ? `https://image.tmdb.org/t/p/w500${media.posterPath}` : "https://placehold.co/500x281?text=No+Poster"}
                                  style={{ objectFit: "cover", height: "140px" }}
                                />
                              </div>
                              <Card.Body className="p-3 d-flex flex-column justify-content-between">
                                <Card.Title className="h6 fw-bold text-truncate mb-2">{media.title || media.name}</Card.Title>
                                <Button
                                  variant="outline-purple"
                                  className="w-100 btn-sm fw-semibold"
                                  style={{ color: "#a855f7", borderColor: "#a855f7" }}
                                  onClick={() => handleNextEpisode(media.tmdbId, 1, 1)}
                                >
                                  🎯 Inizia Episodio 1
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                )}

                {/* ================= 3. SEZIONE FILM ================= */}
                {watchListMovies.length > 0 && (
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3 ps-2 border-start border-3 border-warning d-flex align-items-center gap-2">
                      I tuoi Film{" "}
                      <Badge bg="warning" text="dark" style={{ fontSize: "0.75rem" }}>
                        {watchListMovies.length}
                      </Badge>
                    </h5>
                    <Row className="g-4">
                      {watchListMovies.map((media) => (
                        <Col key={`movie-${media.tmdbId}`} xs={6} sm={4} md={3} lg={2}>
                          <Card
                            style={{ backgroundColor: "#12151c", border: "1px solid #232936", cursor: "pointer", transition: "transform 0.2s ease" }}
                            className="text-white h-100 text-center"
                            onClick={() => navigate(`/details/movie/${media.tmdbId}`)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className="position-relative">
                              <Card.Img
                                variant="top"
                                src={media.posterPath ? `https://image.tmdb.org/t/p/w500${media.posterPath}` : "https://placehold.co/500x750?text=No+Poster"}
                                style={{ objectFit: "cover", height: "220px" }}
                              />
                            </div>
                            <Card.Body className="p-2 d-flex align-items-center justify-content-center">
                              <Card.Title className="small fw-semibold text-truncate mb-0">{media.title || media.name}</Card.Title>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
