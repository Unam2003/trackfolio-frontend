import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Button, Form, Card, Alert } from "react-bootstrap";

const Details = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [savedMediaId, setSavedMediaId] = useState(null);

  const [lastSeasonWatched, setLastSeasonWatched] = useState(0);
  const [lastEpisodeWatched, setLastEpisodeWatched] = useState(0);
  const [mediaStatus, setMediaStatus] = useState("WATCHING");
  const [isSaved, setIsSaved] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [isConfirming, setIsConfirming] = useState(false);

  // controllo se è una serie o un anime
  const isTvShow = type === "tv" || type === "tv_series" || type === "anime";

  const showNotification = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => {
      setToast({ show: false, message: "", variant });
    }, 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const endpoint = isTvShow ? "tv_series" : "movies";

    fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/details?id=${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel caricamento dei dettagli");
        return res.json();
      })
      .then((data) => {
        setContent(data);

        // controllo se l'utente lo ha già nel db
        return fetch(`${import.meta.env.VITE_API_URL}/me/media/check?tmdbId=${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
      })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((status) => {
        console.log("Stato ricevuto dal DB:", status);

        if (status && (status.savedMediaId || status.tmdbId)) {
          setIsSaved(true);
          setSavedMediaId(status.savedMediaId);
          setMediaStatus(status.status || "WATCHING");

          // controllo i campi sia in camelCase che con underscore per sicurezza
          let season = status.lastSeasonWatched;
          if (season === undefined) season = status.last_season_watched;

          let episode = status.lastEpisodeWatched;
          if (episode === undefined) episode = status.last_episode_watched;

          setLastSeasonWatched(season !== null && season !== undefined ? season : 0);
          setLastEpisodeWatched(episode !== null && episode !== undefined ? episode : 0);
        } else {
          setIsSaved(false);
          setLastSeasonWatched(0);
          setLastEpisodeWatched(0);
          setSavedMediaId(null);
          setMediaStatus("WATCHING");
        }
        loading && setLoading(false);
      })
      .catch((err) => {
        console.error("Errore fetch principale:", err);
        setLoading(false);
      });
  }, [id, type, isTvShow]);

  // fetch episodi quando cambia la stagione
  useEffect(() => {
    if (!isTvShow || !id || !content) return;

    const token = localStorage.getItem("token");
    setLoadingEpisodes(true);

    fetch(`${import.meta.env.VITE_API_URL}/tv_series/season?id=${id}&seasonNumber=${activeSeason}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel recupero della stagione");
        return res.json();
      })
      .then((data) => {
        setEpisodes(data.episodes || []);
        setLoadingEpisodes(false);
      })
      .catch((err) => {
        console.error("Errore fetch episodi:", err);
        setEpisodes([]);
        setLoadingEpisodes(false);
      });
  }, [id, isTvShow, activeSeason, content]);

  // click episodio visto
  const handleEpisodeClick = (episodeNumber) => {
    if (!isSaved) {
      showNotification("Aggiungi prima la serie a Trackfolio usando il pulsante in alto!", "warning");
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/tv_series/watch?tmdbId=${id}&season=${activeSeason}&episode=${episodeNumber}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore: serie non trovata nel tuo profilo.");
        return res.json();
      })
      .then((updatedMedia) => {
        setLastSeasonWatched(updatedMedia.lastSeasonWatched || updatedMedia.last_season_watched);
        setLastEpisodeWatched(updatedMedia.lastEpisodeWatched || updatedMedia.last_episode_watched);
        if (updatedMedia.status) setMediaStatus(updatedMedia.status);
      })
      .catch((err) => {
        console.error("Errore salvataggio episodio:", err);
        showNotification(err.message, "danger");
      });
  };

  // Segna la stagione attualmente selezionata come completata
  const handleCompleteCurrentSeason = () => {
    if (!isSaved) {
      showNotification("Aggiungi prima la serie a Trackfolio!", "warning");
      return;
    }
    if (episodes.length === 0) {
      showNotification("Nessun episodio trovato per questa stagione.", "danger");
      return;
    }

    const token = localStorage.getItem("token");
    const lastEpisodeOfSeason = episodes[episodes.length - 1].episode_number;

    setLoadingEpisodes(true);

    fetch(`${import.meta.env.VITE_API_URL}/tv_series/watch?tmdbId=${id}&season=${activeSeason}&episode=${lastEpisodeOfSeason}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Impossibile aggiornare la stagione.");
        return res.json();
      })
      .then((updatedMedia) => {
        setLastSeasonWatched(updatedMedia.lastSeasonWatched || updatedMedia.last_season_watched);
        setLastEpisodeWatched(updatedMedia.lastEpisodeWatched || updatedMedia.last_episode_watched);
        if (updatedMedia.status) setMediaStatus(updatedMedia.status);
        setLoadingEpisodes(false);
        showNotification(`Stagione ${activeSeason} completata! 🍿`, "success");
      })
      .catch((err) => {
        console.error(err);
        setLoadingEpisodes(false);
        showNotification("Errore nel completamento della stagione.", "danger");
      });
  };

  // NUOVA FUNZIONE: Rimuove la stagione vista simulando il click "all'indietro" sul primo episodio
  const handleRemoveCurrentSeason = () => {
    if (!isSaved) return;

    const token = localStorage.getItem("token");
    setLoadingEpisodes(true);

    // CASO 1: Siamo alla stagione 1, resettiamo a Stagione 1, Episodio 0
    if (activeSeason === 1) {
      fetch(`${import.meta.env.VITE_API_URL}/tv_series/watch?tmdbId=${id}&season=1&episode=0`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Impossibile resettare la stagione.");
          return res.json();
        })
        .then((updatedMedia) => {
          setLastSeasonWatched(updatedMedia.lastSeasonWatched || updatedMedia.last_season_watched);
          setLastEpisodeWatched(updatedMedia.lastEpisodeWatched || updatedMedia.last_episode_watched);
          if (updatedMedia.status) setMediaStatus(updatedMedia.status);
          setLoadingEpisodes(false);
          showNotification(`Stagione 1 rimossa dai contenuti visti.`, "warning");
        })
        .catch((err) => {
          console.error(err);
          setLoadingEpisodes(false);
          showNotification("Errore nel reset della stagione.", "danger");
        });
    } else {
      const previousSeason = activeSeason - 1;

      fetch(`${import.meta.env.VITE_API_URL}/tv_series/season?id=${id}&seasonNumber=${previousSeason}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Errore nel recupero della stagione precedente.");
          return res.json();
        })
        .then((data) => {
          const lastEpisodeOfPreviousSeason = data.episodes?.length || 1;

          return fetch(`${import.meta.env.VITE_API_URL}/tv_series/watch?tmdbId=${id}&season=${previousSeason}&episode=${lastEpisodeOfPreviousSeason}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        })
        .then((res) => {
          if (!res.ok) throw new Error("Impossibile rimuovere la stagione vista.");
          return res.json();
        })
        .then((updatedMedia) => {
          setLastSeasonWatched(updatedMedia.lastSeasonWatched || updatedMedia.last_season_watched);
          setLastEpisodeWatched(updatedMedia.lastEpisodeWatched || updatedMedia.last_episode_watched);
          if (updatedMedia.status) setMediaStatus(updatedMedia.status);
          setLoadingEpisodes(false);
          showNotification(`Stagione ${activeSeason} rimossa. Riportato alla stagione ${previousSeason}!`, "warning");
        })
        .catch((err) => {
          console.error(err);
          setLoadingEpisodes(false);
          showNotification("Errore nella rimozione della stagione.", "danger");
        });
    }
  };

  // cambio stato del film (guardato/non guardato)
  const handleToggleMovieWatched = () => {
    const token = localStorage.getItem("token");
    const newStatus = mediaStatus === "COMPLETED" ? "WATCHING" : "COMPLETED";

    fetch(`${import.meta.env.VITE_API_URL}/me/media/${savedMediaId}/status?status=${newStatus}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Impossibile aggiornare lo stato del film.");
        return res.json();
      })
      .then((updatedMedia) => {
        setMediaStatus(updatedMedia.status);
        showNotification(updatedMedia.status === "COMPLETED" ? "Film segnato come Guardato! 🍿" : "Film riportato in Watchlist.", "success");
      })
      .catch((err) => {
        console.error(err);
        showNotification("Errore nell'aggiornamento.", "danger");
      });
  };

  // segna tutta la serie completa
  const handleCompleteWholeTvShow = () => {
    const token = localStorage.getItem("token");
    const lastSeason = content.number_of_seasons || 1;

    setLoadingEpisodes(true);

    fetch(`${import.meta.env.VITE_API_URL}/tv_series/season?id=${id}&seasonNumber=${lastSeason}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel recupero dei dati dell'ultima stagione");
        return res.json();
      })
      .then((data) => {
        const lastEpisode = data.episodes?.length || 1;

        return fetch(`${import.meta.env.VITE_API_URL}/tv_series/watch?tmdbId=${id}&season=${lastSeason}&episode=${lastEpisode}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error("Impossibile completare la serie.");
        return res.json();
      })
      .then((updatedMedia) => {
        setLastSeasonWatched(updatedMedia.lastSeasonWatched || updatedMedia.last_season_watched);
        setLastEpisodeWatched(updatedMedia.lastEpisodeWatched || updatedMedia.last_episode_watched);
        setMediaStatus("COMPLETED");
        setLoadingEpisodes(false);
        showNotification("Serie contrassegnata come completata! 🏁", "success");
      })
      .catch((err) => {
        console.error(err);
        setLoadingEpisodes(false);
        showNotification("Errore durante il completamento della serie.", "danger");
      });
  };

  // aggiungi a trackfolio
  const handleAddToTrackfolio = () => {
    const token = localStorage.getItem("token");

    let backendType = "MOVIE";
    if (type === "tv" || type === "tv_series") {
      backendType = "TV_SERIES";
    } else if (type === "anime") {
      backendType = "ANIME";
    }

    fetch(`${import.meta.env.VITE_API_URL}/me/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: content.name || content.title,
        tmdbId: parseInt(id, 10),
        posterPath: content.poster_path || "",
        type: backendType,
        status: "WATCHING",
        rating: 0,
        lastEpisodeWatched: 0,
        lastSeasonWatched: backendType === "MOVIE" ? 0 : 1,
      }),
    })
      .then((res) => {
        if (res.status === 403 || res.status === 409) {
          setIsSaved(true);
          throw new Error("Contenuto già presente nel tuo Trackfolio.");
        }
        if (!res.ok) throw new Error("Errore durante il salvataggio.");
        return res.json();
      })
      .then((data) => {
        setIsSaved(true);
        setSavedMediaId(data.savedMediaId);
        setMediaStatus("WATCHING");
        setLastSeasonWatched(backendType === "MOVIE" ? 0 : 1);
        setLastEpisodeWatched(0);
        showNotification("Salvato con successo in Trackfolio!", "success");
      })
      .catch((err) => {
        console.error("Errore nel salvataggio:", err);
        showNotification(err.message, "danger");
      });
  };

  // rimuovi da trackfolio
  const handleRemoveFromTrackfolio = () => {
    const token = localStorage.getItem("token");

    if (!savedMediaId) {
      showNotification("Impossibile rimuovere: ID non trovato.", "danger");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/me/media/${savedMediaId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore durante la rimozione.");

        setIsSaved(false);
        setSavedMediaId(null);
        setLastSeasonWatched(0);
        setLastEpisodeWatched(0);
        setMediaStatus("WATCHING");
        showNotification("Rimosso con successo da Trackfolio!", "warning");
      })
      .catch((err) => {
        console.error("Errore nella rimozione:", err);
        showNotification(err.message, "danger");
      });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5" style={{ minHeight: "30vh" }}>
        <Spinner animation="border" style={{ color: "#a855f7" }} />
      </div>
    );
  }

  if (!content) return <div className="text-center text-white mt-5">Contenuto non trovato.</div>;

  const totalSeasons = content.number_of_seasons || 0;
  const seasonsArray = Array.from({ length: totalSeasons }, (_, i) => i + 1);

  // Calcolo per capire se la stagione corrente è già stata interamente completata
  const isCurrentSeasonFullyWatched =
    episodes.length > 0 &&
    (activeSeason < lastSeasonWatched || (activeSeason === lastSeasonWatched && lastEpisodeWatched >= episodes[episodes.length - 1].episode_number));

  return (
    <Container className="text-white mt-4" style={{ position: "relative" }}>
      {toast.show && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 9999, minWidth: "320px", textAlign: "center" }}>
          <Alert variant={toast.variant} className="shadow-lg fw-bold border-0">
            {toast.message}
          </Alert>
        </div>
      )}

      <Button variant="outline-light" className="mb-4 border-secondary text-white-50 shadow-sm custom-back-btn" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2"></i>Torna indietro
      </Button>

      <Row className="g-4 mb-5 align-items-start">
        <Col xs={12} sm={5} md={3}>
          <img
            src={content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : "https://placehold.co/500x750?text=No+Poster"}
            className="img-fluid rounded border border-secondary shadow-lg"
            alt={content.title || content.name}
          />
        </Col>

        <Col xs={12} sm={7} md={9}>
          <h1 className="fw-bold text-white mb-2 display-5">{content.title || content.name}</h1>

          {content.tagline && (
            <p className="italic fst-italic mb-3" style={{ color: "#a855f7", fontSize: "1.1rem" }}>
              "{content.tagline}"
            </p>
          )}

          <p className="text-white-50 lead mb-4" style={{ lineHeight: "1.6", fontSize: "1.05rem" }}>
            {content.overview || content.description || "Nessuna descrizione disponibile in italiano."}
          </p>

          <div className="bg-dark p-3 rounded border border-secondary d-flex flex-wrap gap-4 align-items-center shadow-sm mb-4">
            <span>
              Uscita: <strong className="text-white">{(content.release_date || content.first_air_date || "N/A").substring(0, 4)}</strong>
            </span>
            {isTvShow && totalSeasons > 0 && (
              <span>
                Stagioni: <strong className="text-white">{totalSeasons}</strong>
              </span>
            )}
            {!isTvShow && content.runtime && (
              <span>
                Durata: <strong className="text-white">{content.runtime} min</strong>
              </span>
            )}
            <span>
              Voto: <strong className="text-warning">⭐ {content.vote_average ? content.vote_average.toFixed(1) : "N/A"}</strong>
            </span>
          </div>

          <div className="d-flex flex-wrap gap-3 align-items-center">
            {!isSaved ? (
              <Button
                className="fw-bold px-4 py-2 shadow"
                style={{ backgroundColor: "#a855f7", borderColor: "#a855f7", borderRadius: "8px" }}
                onClick={handleAddToTrackfolio}
              >
                <i className="bi bi-plus-circle me-2"></i>Aggiungi a Trackfolio
              </Button>
            ) : (
              <>
                <span className="badge bg-secondary p-2 fs-6 border border-light text-white shadow-sm">
                  <i className="bi bi-bookmark-check-fill me-2 text-warning"></i>In Watchlist
                </span>

                {!isTvShow ? (
                  <Button
                    variant={mediaStatus === "COMPLETED" ? "success" : "outline-success"}
                    className="fw-bold px-3 py-1.5 shadow-sm"
                    style={{ borderRadius: "8px" }}
                    onClick={handleToggleMovieWatched}
                  >
                    <i className={`bi ${mediaStatus === "COMPLETED" ? "bi-eye-fill" : "bi-eye"} me-2`}></i>
                    {mediaStatus === "COMPLETED" ? "Guardato ✓" : "Segna come Guardato"}
                  </Button>
                ) : (
                  mediaStatus !== "COMPLETED" && (
                    <Button
                      variant="outline-success"
                      className="fw-bold px-3 py-1.5 shadow-sm"
                      style={{ borderRadius: "8px" }}
                      onClick={handleCompleteWholeTvShow}
                    >
                      <i className="bi bi-check2-all me-2"></i>Segna come Completata
                    </Button>
                  )
                )}

                {!isConfirming ? (
                  <Button
                    variant="outline-danger"
                    className="fw-bold px-3 py-1.5 shadow-sm"
                    style={{ borderRadius: "8px" }}
                    onClick={() => setIsConfirming(true)}
                  >
                    <i className="bi bi-trash3 me-2"></i>Rimuovi
                  </Button>
                ) : (
                  <div className="d-flex align-items-center gap-2 bg-dark p-1 rounded border border-danger">
                    <span className="text-danger small fw-bold px-2">Sicuro?</span>
                    <Button
                      variant="danger"
                      size="sm"
                      className="fw-bold"
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
                )}
              </>
            )}
          </div>
        </Col>
      </Row>

      {content.credits && content.credits.cast && content.credits.cast.length > 0 && (
        <div className="border-top border-secondary pt-4 mb-5">
          <h4 className="fw-bold mb-4 ps-2 text-white border-start border-3" style={{ borderColor: "#a855f7" }}>
            Cast Principale
          </h4>
          <div className="d-flex gap-3 overflow-auto pb-3 custom-scrollbar" style={{ whiteSpace: "nowrap" }}>
            {content.credits.cast.slice(0, 14).map((actor) => (
              <div
                key={actor.id}
                style={{ width: "130px", flexShrink: 0, cursor: "pointer" }}
                className="text-center"
                onClick={() => navigate(`/actor/${actor.id}`)}
              >
                <img
                  src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "https://placehold.co/185x278?text=No+Image"}
                  alt={actor.name}
                  className="rounded border border-secondary shadow-sm mb-2"
                  style={{ width: "100%", height: "175px", objectFit: "cover" }}
                />
                <h6 className="fw-bold mb-0 text-truncate small text-white" title={actor.name}>
                  {actor.name}
                </h6>
                <p className="text-white-50 text-truncate m-0" style={{ fontSize: "0.75rem" }} title={actor.character}>
                  {actor.character}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isTvShow && totalSeasons > 0 && (
        <div className="border-top border-secondary pt-4 mb-5">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
            <h4 className="fw-bold mb-0 ps-2 text-white border-start border-3" style={{ borderColor: "#a855f7" }}>
              Lista Episodi
            </h4>

            <div className="d-flex gap-2 w-100 w-sm-auto align-items-center">
              {/* CAMBIO PULSANTE DINAMICO COMPLETA/RIMUOVI STAGIONE */}
              {isSaved &&
                episodes.length > 0 &&
                (!isCurrentSeasonFullyWatched ? (
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="fw-bold text-nowrap"
                    style={{ borderRadius: "6px", borderColor: "#38bdf8", color: "#38bdf8" }}
                    onClick={handleCompleteCurrentSeason}
                  >
                    <i className="bi bi-check-all me-1"></i> Completa Stagione {activeSeason}
                  </Button>
                ) : (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="fw-bold text-nowrap"
                    style={{ borderRadius: "6px" }}
                    onClick={handleRemoveCurrentSeason}
                  >
                    <i className="bi bi-x-circle me-1"></i> Rimuovi Stagione {activeSeason} vista
                  </Button>
                ))}

              <Form.Select
                className="bg-dark text-white border-secondary text-center shadow-sm"
                style={{ width: "160px" }}
                value={activeSeason}
                onChange={(e) => setActiveSeason(Number(e.target.value))}
              >
                {seasonsArray.map((num) => (
                  <option key={num} value={num}>
                    Stagione {num}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          {loadingEpisodes ? (
            <div className="text-center my-4">
              <Spinner animation="border" style={{ color: "#a855f7" }} />
            </div>
          ) : (
            <Row className="g-3">
              {episodes.map((ep) => {
                const isWatched = activeSeason < lastSeasonWatched || (activeSeason === lastSeasonWatched && ep.episode_number <= lastEpisodeWatched);
                return (
                  <Col xs={12} key={ep.id}>
                    <Card className="bg-dark border-secondary text-white p-2 shadow-sm">
                      <Row className="align-items-center g-3 mx-0">
                        <Col xs={4} sm={3} md={2} className="px-0">
                          <Card.Img
                            src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : "https://placehold.co/300x169?text=No+Image"}
                            className="rounded border border-secondary img-fluid"
                          />
                        </Col>
                        <Col xs={5} sm={6} md={8}>
                          <h6 className="fw-bold mb-1">
                            {ep.episode_number}. {ep.name}
                          </h6>
                          <p className="text-white-50 small mb-0 d-none d-sm-block">{ep.overview || "Nessuna descrizione disponibile."}</p>
                        </Col>
                        <Col xs={3} sm={3} md={2} className="text-end pe-2 d-flex flex-column align-items-center justify-content-center">
                          <button
                            className="btn d-flex align-items-center justify-content-center rounded-circle p-0"
                            style={{
                              width: "45px",
                              height: "45px",
                              border: "2px solid #a855f7",
                              color: isWatched ? "#fff" : "#a855f7",
                              backgroundColor: isWatched ? "#a855f7" : "transparent",
                            }}
                            onClick={() => handleEpisodeClick(ep.episode_number)}
                          >
                            <i className="bi bi-check-lg" style={{ fontSize: "1.4rem" }}></i>
                          </button>
                          <span className="fw-bold mt-1" style={{ fontSize: "0.65rem", color: isWatched ? "#a855f7" : "#6c757d" }}>
                            VISTO
                          </span>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      )}
    </Container>
  );
};

export default Details;
