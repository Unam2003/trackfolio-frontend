import { useState, useEffect } from "react";
import { Container, Row, Col, Carousel, Card, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MySidebar from "../components/MySidebar";

const GamesHome = () => {
  const navigate = useNavigate();
  const [trendingGames, setTrendingGames] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [actionGames, setActionGames] = useState([]);
  const [indieGames, setIndieGames] = useState([]);

  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingAction, setLoadingAction] = useState(true);
  const [loadingIndie, setLoadingIndie] = useState(true);

  const [erroreGames, setErroreGames] = useState("");
  const [erroreUpcoming, setErroreUpcoming] = useState("");
  const [erroreAction, setErroreAction] = useState("");
  const [erroreIndie, setErroreIndie] = useState("");

  const [itemsPerSlide, setItemsPerSlide] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        setItemsPerSlide(2); // da telefono: 2 card insieme
      } else if (window.innerWidth < 992) {
        setItemsPerSlide(3); // da tablet: 3 card insieme
      } else {
        setItemsPerSlide(4); // da pc: 4 card insieme
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const token = localStorage.getItem("token");

    //  ----------------> GIOCHI TRENDING <----------------
    fetch("http://localhost:3001/games/trending", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Errore " + res.status);
      })
      .then((data) => {
        setTrendingGames(data.content || data.results || data);
        setLoadingGames(false);
      })
      .catch(() => {
        setErroreGames("errore durante il caricamento dei giochi.");
        setLoadingGames(false);
      });

    //  ----------------> COMING SOON <----------------
    fetch("http://localhost:3001/games/upcoming", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Errore " + res.status);
      })
      .then((data) => {
        setUpcomingGames(data.content || data.results || data);
        setLoadingUpcoming(false);
      })
      .catch(() => {
        setErroreUpcoming("errore durante il caricamento dei giochi in uscita.");
        setLoadingUpcoming(false);
      });

    //  ----------------> ACTION GAMES <----------------
    fetch("http://localhost:3001/games/genre/action", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Errore " + res.status);
      })
      .then((data) => {
        setActionGames(data.content || data.results || data);
        setLoadingAction(false);
      })
      .catch(() => {
        setErroreAction("errore durante il caricamento dei giochi action.");
        setLoadingAction(false);
      });

    //  ----------------> INDIE GAMES <----------------
    fetch("http://localhost:3001/games/genre/indie", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Errore " + res.status);
      })
      .then((data) => {
        setIndieGames(data.content || data.results || data);
        setLoadingIndie(false);
      })
      .catch(() => {
        setErroreIndie("errore durante il caricamento dei giochi indie.");
        setLoadingIndie(false);
      });

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    if (!Array.isArray(array)) return chunks;
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const renderCarouselSection = (title, subtitle, loading, error, gamesData) => (
    <div className="mb-5">
      <h4 className="fw-bold mb-1 ps-2 text-white border-start border-3" style={{ borderColor: "#a855f7" }}>
        {title} <i className="bi bi-chevron-right fs-5 ms-1 text-secondary"></i>
      </h4>
      <p className="text-white-50 small ps-2 mb-3">{subtitle}</p>

      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" style={{ color: "#a855f7" }} />
        </div>
      ) : error ? (
        <Alert variant="danger" className="bg-dark text-danger border-danger my-2">
          {error}
        </Alert>
      ) : (
        <Carousel indicators={false} interval={null} className="custom-home-carousel">
          {chunkArray(gamesData, itemsPerSlide).map((chunk, index) => (
            <Carousel.Item key={index}>
              <Row className="g-3 mx-0 px-2 px-md-0 justify-content-center">
                {chunk.map((game) => (
                  <Col key={game.id} xs={6} sm={itemsPerSlide === 3 ? 4 : 3}>
                    <Card
                      className="bg-transparent border-0 text-white h-100 custom-movie-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/details/game/${game.id}`)}
                    >
                      <Card.Img
                        variant="top"
                        src={game.background_image || "https://placehold.co/500x281?text=No+Image"}
                        className="img-fluid border border-secondary custom-img-hover rounded"
                      />
                      <Card.Body className="p-2 px-1">
                        <Card.Title className="h6 fw-bold mb-0 text-truncate">{game.name}</Card.Title>
                        <Card.Text className="text-white-50 x-small mt-1" style={{ fontSize: "0.8rem" }}>
                          Uscita: {game.released ? new Date(game.released).getFullYear() : "N/A"} <br />
                          Voto: ⭐ {game.rating ? game.rating.toFixed(1) : "N/A"}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>
      )}
    </div>
  );

  return (
    <Container fluid className="px-3 px-md-5 my-4">
      <Row className="justify-content-center align-items-start g-4">
        {/* SIDEBAR SINISTRA */}
        <Col xs={12} md={3} lg={2} className="sticky-md-top" style={{ top: "90px", zIndex: 10 }}>
          <MySidebar />
        </Col>

        {/* CONTENUTO PRINCIPALE */}
        <Col xs={12} md={9} lg={10} className="text-white">
          {renderCarouselSection("Videogiochi di tendenza", "I giochi più popolari del momento", loadingGames, erroreGames, trendingGames)}
          {renderCarouselSection("Coming Soon", "I giochi in uscita più attesi", loadingUpcoming, erroreUpcoming, upcomingGames)}
          {renderCarouselSection("Action Games", "Azione pura e adrenalina", loadingAction, erroreAction, actionGames)}
          {renderCarouselSection("Indie Games", "Giochi indipendenti e creativi", loadingIndie, erroreIndie, indieGames)}
        </Col>
      </Row>

      <style>{`
        .custom-img-hover {
          transition: transform 0.3s ease;
        }
        .custom-img-hover:hover {
          transform: scale(1.05);
        }
      `}</style>
    </Container>
  );
};

export default GamesHome;
