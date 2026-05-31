import { useState, useEffect } from "react";
import { Container, Row, Col, Carousel, Card, Spinner, Alert } from "react-bootstrap";
import MySidebar from "../components/MySidebar";
import { Link } from "react-router-dom";

const Esplora = () => {
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);

  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingAnime, setLoadingAnime] = useState(true);

  const [erroreSeries, setErroreSeries] = useState("");
  const [erroreMovies, setErroreMovies] = useState("");
  const [erroreAnime, setErroreAnime] = useState("");

  const [itemsPerSlide, setItemsPerSlide] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        setItemsPerSlide(2);
      } else if (window.innerWidth < 992) {
        setItemsPerSlide(3);
      } else {
        setItemsPerSlide(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const token = localStorage.getItem("token");

    // fetch serie tv
    const getSeries = function () {
      setLoadingSeries(true);
      fetch(`${import.meta.env.VITE_API_URL}/tv_series?page=1`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Errore " + res.status);
        })
        .then((data) => {
          const arrayContenuti = data.content || data.results || data;
          setTrendingSeries(arrayContenuti);
          setLoadingSeries(false);
        })
        .catch((err) => {
          console.error("ERRORE SULLE SERIE TV:", err);
          setErroreSeries("errore durante il caricamento delle serie TV.");
          setLoadingSeries(false);
        });
    };

    // fetch film
    const getMovies = function () {
      setLoadingMovies(true);
      fetch(`${import.meta.env.VITE_API_URL}/movies?page=1`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Errore " + res.status);
        })
        .then((data) => {
          const arrayContenuti = data.content || data.results || data;
          setTrendingMovies(arrayContenuti);
          setLoadingMovies(false);
        })
        .catch((err) => {
          console.error("ERRORE SUI FILM:", err);
          setErroreMovies("errore durante il caricamento dei film.");
          setLoadingMovies(false);
        });
    };

    // fetch anime
    const getAnime = function () {
      setLoadingAnime(true);
      fetch(`${import.meta.env.VITE_API_URL}/anime?page=1`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Errore " + res.status);
        })
        .then((data) => {
          const arrayContenuti = data.content || data.results || data;
          setTrendingAnime(arrayContenuti);
          setLoadingAnime(false);
        })
        .catch((err) => {
          console.error("ERRORE SUGLI ANIME:", err);
          setErroreAnime("errore durante il caricamento degli anime.");
          setLoadingAnime(false);
        });
    };

    getSeries();
    getMovies();
    getAnime();

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

  return (
    <Container fluid className="px-3 px-md-5 my-4">
      <Row className="justify-content-center align-items-start g-4">
        <Col xs={12} md={3} lg={2} className="sidebar-sticky-col">
          <MySidebar />
        </Col>

        <Col xs={12} md={9} lg={10} className="text-white">
          {/* Sezione Serie TV */}
          <div className="mb-5">
            <h4 className="fw-bold mb-1 ps-2 text-white border-start border-3 border-purple">
              Serie TV di tendenza <i className="bi bi-chevron-right fs-5 ms-1 text-secondary"></i>
            </h4>
            <p className="text-white-50 small ps-2 mb-3">Le serie più popolari</p>

            {loadingSeries ? (
              <div className="d-flex justify-content-center my-4">
                <Spinner animation="border" style={{ color: "#a855f7" }} />
              </div>
            ) : erroreSeries ? (
              <Alert variant="danger" className="bg-dark text-danger border-danger my-2">
                {erroreSeries}
              </Alert>
            ) : (
              <Carousel indicators={false} interval={null} className="custom-home-carousel">
                {chunkArray(trendingSeries, itemsPerSlide).map((chunk, index) => (
                  <Carousel.Item key={index}>
                    <Row className="g-3 mx-0 px-2 px-md-0 justify-content-center">
                      {chunk.map((tv) => (
                        <Col key={tv.id} xs={6} sm={itemsPerSlide === 3 ? 4 : 3}>
                          <Link to={`/details/tv/${tv.id}`} style={{ textDecoration: "none" }}>
                            <Card className="bg-transparent border-0 text-white h-100 custom-movie-card">
                              <Card.Img
                                variant="top"
                                src={
                                  tv.backdrop_path
                                    ? `https://image.tmdb.org/t/p/w500${tv.backdrop_path}`
                                    : tv.poster_path
                                      ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
                                      : tv.coverUrl || "https://placehold.co/500x281?text=No+Image"
                                }
                                className="img-fluid border border-secondary"
                              />
                              <Card.Body className="p-2">
                                <Card.Title className="h6 fw-bold mb-0 text-truncate">{tv.title || tv.name}</Card.Title>
                                <Card.Text className="text-white-50 x-small mt-1">
                                  Uscita: {tv.first_air_date && tv.first_air_date.length >= 4 ? tv.first_air_date.substring(0, 4) : "N/A"} <br />
                                  Voto: ⭐ {tv.vote_average ? tv.vote_average.toFixed(1) : "N/A"}
                                </Card.Text>
                              </Card.Body>
                            </Card>
                          </Link>
                        </Col>
                      ))}
                    </Row>
                  </Carousel.Item>
                ))}
              </Carousel>
            )}
          </div>

          {/* Sezione Film */}
          <div className="mb-5">
            <h4 className="fw-bold mb-1 ps-2 text-white border-start border-3 border-purple">
              Film di tendenza <i className="bi bi-chevron-right fs-5 ms-1 text-secondary"></i>
            </h4>
            <p className="text-white-50 small ps-2 mb-3">I film che non devi assolutamente perdere</p>

            {loadingMovies ? (
              <div className="d-flex justify-content-center my-4">
                <Spinner animation="border" style={{ color: "#a855f7" }} />
              </div>
            ) : erroreMovies ? (
              <Alert variant="danger" className="bg-dark text-danger border-danger my-2">
                {erroreMovies}
              </Alert>
            ) : (
              <Carousel indicators={false} interval={null} className="custom-home-carousel">
                {chunkArray(trendingMovies, itemsPerSlide).map((chunk, index) => (
                  <Carousel.Item key={index}>
                    <Row className="g-3 mx-0 px-2 px-md-0 justify-content-center">
                      {chunk.map((movie) => (
                        <Col key={movie.id} xs={6} sm={itemsPerSlide === 3 ? 4 : 3}>
                          <Link to={`/details/movie/${movie.id}`} style={{ textDecoration: "none" }}>
                            <Card className="bg-transparent border-0 text-white h-100 custom-movie-card">
                              <Card.Img
                                variant="top"
                                src={
                                  movie.backdrop_path
                                    ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                                    : movie.poster_path
                                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                      : movie.coverUrl || "https://placehold.co/500x281?text=No+Image"
                                }
                                className="img-fluid border border-secondary"
                              />
                              <Card.Body className="p-2">
                                <Card.Title className="h6 fw-bold mb-0 text-truncate">{movie.title || movie.name}</Card.Title>
                                <Card.Text className="text-white-50 x-small mt-1">
                                  Uscita: {movie.release_date && movie.release_date.length >= 4 ? movie.release_date.substring(0, 4) : "N/A"} <br />
                                  Voto: ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                                </Card.Text>
                              </Card.Body>
                            </Card>
                          </Link>
                        </Col>
                      ))}
                    </Row>
                  </Carousel.Item>
                ))}
              </Carousel>
            )}
          </div>

          {/* Sezione Anime */}
          <div>
            <h4 className="fw-bold mb-1 ps-2 text-white border-start border-3 border-purple">
              Anime di tendenza <i className="bi bi-chevron-right fs-5 ms-1 text-secondary"></i>
            </h4>
            <p className="text-white-50 small ps-2 mb-3">L'animazione giapponese più seguita</p>

            {loadingAnime ? (
              <div className="d-flex justify-content-center my-4">
                <Spinner animation="border" style={{ color: "#a855f7" }} />
              </div>
            ) : erroreAnime ? (
              <Alert variant="danger" className="bg-dark text-danger border-danger my-2">
                {erroreAnime}
              </Alert>
            ) : (
              <Carousel indicators={false} interval={null} className="custom-home-carousel">
                {chunkArray(trendingAnime, itemsPerSlide).map((chunk, index) => (
                  <Carousel.Item key={index}>
                    <Row className="g-3 mx-0 px-2 px-md-0 justify-content-center">
                      {chunk.map((anime) => (
                        <Col key={anime.id} xs={6} sm={itemsPerSlide === 3 ? 4 : 3}>
                          <Link to={`/details/anime/${anime.id}`} style={{ textDecoration: "none" }}>
                            <Card className="bg-transparent border-0 text-white h-100 custom-movie-card">
                              <Card.Img
                                variant="top"
                                src={
                                  anime.backdrop_path
                                    ? `https://image.tmdb.org/t/p/w500${anime.backdrop_path}`
                                    : anime.poster_path
                                      ? `https://image.tmdb.org/t/p/w500${anime.poster_path}`
                                      : anime.coverUrl || "https://placehold.co/500x281?text=No+Image"
                                }
                                className="img-fluid border border-secondary"
                              />
                              <Card.Body className="p-2">
                                <Card.Title className="h6 fw-bold mb-0 text-truncate">{anime.title || anime.name}</Card.Title>
                                <Card.Text className="text-white-50 x-small mt-1">
                                  Uscita: {anime.first_air_date && anime.first_air_date.length >= 4 ? anime.first_air_date.substring(0, 4) : "N/A"} <br />
                                  Voto: ⭐ {anime.vote_average ? anime.vote_average.toFixed(1) : "N/A"}
                                </Card.Text>
                              </Card.Body>
                            </Card>
                          </Link>
                        </Col>
                      ))}
                    </Row>
                  </Carousel.Item>
                ))}
              </Carousel>
            )}
          </div>
        </Col>
      </Row>

      <style>{`
        @media (min-width: 768px) {
          .sidebar-sticky-col {
            position: sticky !important;
            top: 24px;
            z-index: 1020;
          }
        }
      `}</style>
    </Container>
  );
};

export default Esplora;
