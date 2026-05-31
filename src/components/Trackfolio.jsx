import { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Badge } from "react-bootstrap";
import MySidebar from "./MySidebar";
import { useNavigate } from "react-router-dom";

const Trackfolio = () => {
  const navigate = useNavigate();
  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/me/media`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore caricamento media");
        return res.json();
      })
      .then((data) => {
        setAllMedia(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setAllMedia([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = allMedia.filter((m) => m.status !== "COMPLETED");
  const completed = allMedia.filter((m) => m.status === "COMPLETED");

  const MediaCard = ({ media, completedView }) => (
    <div onClick={() => navigate(`/details/${media.type.toLowerCase()}/${media.tmdbId}`)} className="track-card">
      <img src={`https://image.tmdb.org/t/p/w500${media.posterPath}`} className="img-fluid rounded" alt={media.title} />
      <p className="mt-2 small fw-bold text-truncate">{media.title}</p>

      {completedView && (
        <Badge bg="success" className="position-absolute bottom-0 end-0 m-1">
          Completato
        </Badge>
      )}
    </div>
  );

  return (
    <Container fluid className="px-5 my-4">
      <Row>
        <Col xs={12} md={3} lg={2}>
          <MySidebar />
        </Col>

        <Col xs={12} md={9} lg={10} className="text-white">
          <h2 className="fw-bold mb-4">Il mio Trackfolio</h2>

          {loading ? (
            <div className="d-flex justify-content-center mt-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <h4 className="mb-3">In corso ({active.length})</h4>
              <Row className="g-3 mb-5">
                {active.map((m) => (
                  <Col key={m.tmdbId} xs={6} sm={4} md={3} lg={2}>
                    <MediaCard media={m} />
                  </Col>
                ))}
              </Row>

              <div className="mt-5 pt-4 border-top border-secondary">
                <h4 className="text-white mb-3">
                  <i className="bi bi-check2-all text-success me-2"></i>
                  Archivio Completati ({completed.length})
                </h4>

                <Row className="g-3">
                  {completed.map((m) => (
                    <Col key={m.tmdbId} xs={6} sm={4} md={3} lg={2}>
                      <MediaCard media={m} completedView />
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}
        </Col>
      </Row>

      <style>{`
        .track-card {
          cursor: pointer;
          transition: transform 0.2s ease;
          position: relative;
        }

        .track-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </Container>
  );
};

export default Trackfolio;
