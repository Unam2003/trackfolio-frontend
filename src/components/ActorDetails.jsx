import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";

const ActorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:3001/actors/details?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel recupero dei dettagli attore");
        return res.json();
      })
      .then((data) => {
        setActor(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5" style={{ minHeight: "50vh" }}>
        <Spinner animation="border" style={{ color: "#a855f7" }} />
      </div>
    );
  }

  if (!actor) {
    return <div className="text-center text-white mt-5">Attore non trovato.</div>;
  }

  const calcolaEta = (birth, death) => {
    if (!birth) return "N/A";
    const dataNascita = new Date(birth);
    const dataFine = death ? new Date(death) : new Date();

    let eta = dataFine.getFullYear() - dataNascita.getFullYear();
    const mese = dataFine.getMonth() - dataNascita.getMonth();

    if (mese < 0 || (mese === 0 && dataFine.getDate() < dataNascita.getDate())) {
      eta--;
    }
    return eta;
  };

  let sortedCredits = [];
  if (actor.combined_credits && actor.combined_credits.cast) {
    sortedCredits = [...actor.combined_credits.cast].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).filter((media) => media.poster_path);
  }

  return (
    <Container className="text-white mt-4">
      <Button variant="outline-light" className="mb-4 border-secondary text-white-50 shadow-sm" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2"></i>Torna indietro
      </Button>

      <Row className="g-4 align-items-start">
        <Col xs={12} sm={4} md={3}>
          <img
            src={actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : "https://placehold.co/500x750?text=No+Image"}
            className="img-fluid rounded border border-secondary shadow-lg"
            alt={actor.name}
          />
        </Col>

        <Col xs={12} sm={8} md={9}>
          <h1 className="fw-bold text-white mb-3 display-5">{actor.name}</h1>

          <div className="bg-dark p-3 rounded border border-secondary d-flex flex-wrap gap-4 align-items-center shadow-sm mb-4" style={{ fontSize: "0.95rem" }}>
            <span>
              Nascita: <strong className="text-white">{actor.birthday || "N/A"}</strong>
            </span>

            {actor.deathday && (
              <span>
                Decesso: <strong className="text-danger">{actor.deathday}</strong>
              </span>
            )}

            <span>
              {actor.deathday ? "Età al decesso: " : "Età attuale: "}
              <strong className="text-white">{calcolaEta(actor.birthday, actor.deathday)} anni</strong>
            </span>

            {actor.place_of_birth && (
              <span>
                Luogo: <strong className="text-white">{actor.place_of_birth}</strong>
              </span>
            )}

            {actor.known_for_department && (
              <span>
                Ruolo: <strong className="text-white">{actor.known_for_department}</strong>
              </span>
            )}

            {actor.popularity && (
              <span>
                Popolarità: <strong className="text-warning">🔥 {actor.popularity.toFixed(0)}</strong>
              </span>
            )}
          </div>

          <h4 className="fw-bold mb-3 text-white">Biografia</h4>
          <p className="text-white-50" style={{ lineHeight: "1.6", fontSize: "1.05rem", whiteSpace: "pre-line" }}>
            {actor.biography}
          </p>
        </Col>
      </Row>

      {sortedCredits.length > 0 && (
        <div className="border-top border-secondary pt-4 mt-5 mb-5">
          <h4 className="fw-bold mb-4 ps-2 border-start border-3" style={{ borderColor: "#a855f7" }}>
            Conosciuto/a per
          </h4>
          <div className="d-flex gap-3 overflow-auto pb-3 custom-scrollbar" style={{ whiteSpace: "nowrap" }}>
            {sortedCredits.slice(0, 15).map((media) => (
              <div
                key={`${media.id}-${media.media_type}`}
                style={{ width: "130px", flexShrink: 0, cursor: "pointer" }}
                className="text-center"
                onClick={() => navigate(`/details/${media.media_type}/${media.id}`)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w185${media.poster_path}`}
                  alt={media.title || media.name}
                  className="rounded border border-secondary shadow-sm mb-2"
                  style={{ width: "100%", height: "175px", objectFit: "cover" }}
                />
                <h6 className="fw-bold mb-0 text-truncate small text-white" title={media.title || media.name}>
                  {media.title || media.name}
                </h6>
                <p className="text-white-50 text-truncate m-0" style={{ fontSize: "0.75rem" }} title={media.character}>
                  {media.character ? `nei panni di ${media.character}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default ActorDetails;
