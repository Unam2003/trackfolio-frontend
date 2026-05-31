import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import MySidebar from "./MySidebar";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const gameQuery = searchParams.get("game");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const activeQuery = query || gameQuery;

    if (!activeQuery) return;

    setLoading(true);
    setError("");

    if (gameQuery) {
      const url = `http://localhost:3001/games/search?query=${encodeURIComponent(gameQuery)}`;

      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Errore nel recupero dei giochi");
          return res.json();
        })
        .then((data) => {
          const rawGames = data.content || data.results || data || [];
          const sortedGames = rawGames.map((g) => ({ ...g, isGame: true })).sort((a, b) => (b.added || 0) - (a.added || 0));

          setResults(sortedGames);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Impossibile caricare i risultati di ricerca.");
          setLoading(false);
        });
    } else {
      const fetchMovies = fetch(`http://localhost:3001/movies/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => (res.ok ? res.json() : []));

      const fetchTv = fetch(`http://localhost:3001/tv_series/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => (res.ok ? res.json() : []));

      Promise.all([fetchMovies, fetchTv])
        .then(([moviesData, tvData]) => {
          const combined = [
            ...(moviesData.content || moviesData || []).map((m) => ({ ...m, mediaType: "movie", isGame: false })),
            ...(tvData.content || tvData || []).map((t) => ({ ...t, mediaType: "tv", isGame: false })),
          ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

          setResults(combined);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Impossibile caricare i risultati di ricerca.");
          setLoading(false);
        });
    }
  }, [query, gameQuery]);

  return (
    <Container fluid className="px-5 my-4">
      <Row className="justify-content-center align-items-start g-4">
        <Col xs={12} md={3} lg={2}>
          <MySidebar />
        </Col>

        <Col xs={12} md={9} lg={10} className="text-white">
          <h4 className="fw-bold mb-1 ps-2 border-start border-3 border-purple text-white">
            Risultati per: <span className="text-purple">"{query || gameQuery}"</span>
          </h4>
          <p className="text-white-50 small ps-2 mb-4">I titoli più popolari in catalogo</p>

          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" style={{ color: "#a855f7" }} />
            </div>
          ) : error ? (
            <Alert variant="danger" className="bg-dark text-danger border-danger">
              {error}
            </Alert>
          ) : results.length === 0 ? (
            <p className="ps-2 text-white-50">Nessun risultato trovato.</p>
          ) : (
            <Row className="g-4">
              {results.map((item) => {
                const detailPath = item.isGame ? `/details/game/${item.id}` : `/details/${item.mediaType}/${item.id}`;

                return (
                  <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
                    <Link to={detailPath} style={{ textDecoration: "none" }}>
                      <Card style={{ backgroundColor: "#12151c", border: "1px solid #232936" }} className="text-white h-100 custom-search-card">
                        <Card.Img
                          variant="top"
                          src={
                            item.backdrop_path || item.poster_path
                              ? `https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`
                              : item.background_image || item.coverUrl || "https://placehold.co/500x281?text=No+Image"
                          }
                          className="img-fluid rounded-top"
                          style={{ objectFit: "cover", height: "160px" }}
                        />
                        <Card.Body className="p-3">
                          <Card.Title className="h6 fw-bold text-truncate mb-1 text-white">{item.title || item.name}</Card.Title>
                          <Card.Text className="text-white-50 small mb-0">
                            {item.isGame ? (
                              `Voto RAWG: ⭐ ${item.rating ? item.rating.toFixed(1) : "N/A"}`
                            ) : (
                              <>
                                {item.release_date || item.first_air_date ? `Uscita: ${(item.release_date || item.first_air_date).substring(0, 4)}` : "Media"}
                                <br />
                                Voto: ⭐ {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
                              </>
                            )}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchResults;
