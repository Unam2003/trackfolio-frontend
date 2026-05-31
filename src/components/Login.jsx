import { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrore("");

    fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
      }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Credenziali non valide");
        }
      })
      .then((data) => {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("utenteLoggato", "true");
        localStorage.setItem("user", JSON.stringify(data.user));

        setLoading(false);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error(err);
        setErrore("Email o Password errati. Riprova.");
        setLoading(false);
      });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#090a0f" }}>
      {/* TRUCCO DELLO STUDENTE: Inseriamo un piccolo tag <style> volante per forzare il colore dei placeholder */}
      <style>
        {`
          .custom-placeholder::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
            opacity: 1;
          }
        `}
      </style>

      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5} xl={4}>
            <div
              className="p-4 p-sm-5 rounded text-white text-center"
              style={{
                backgroundColor: "#12151c",
                border: "1px solid #232936",
              }}
            >
              {/* LOGO */}
              <h1
                className="mb-2 fw-bold"
                style={{
                  fontSize: "32px",
                  letterSpacing: "1px",
                  color: "#a855f7",
                }}
              >
                TRACKFOLIO
              </h1>
              <p className="text-white-50 small mb-4">Accedi per gestire i tuoi film, serie TV, anime e videogiochi</p>

              {/* ERRORE ALERT */}
              {errore && (
                <Alert variant="danger" className="py-2 small bg-dark text-danger border-danger mb-3">
                  {errore}
                </Alert>
              )}

              {/* FORM */}
              <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3 text-start">
                <Form.Group>
                  <Form.Label className="small text-white-50 ps-1">Indirizzo Email</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder="nome@esempio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ backgroundColor: "#1a1f2c", border: "1px solid #2d3548", color: "#ffffff" }}
                    className="py-2 shadow-none custom-placeholder"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small text-white-50 ps-1">Password</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ backgroundColor: "#1a1f2c", border: "1px solid #2d3548", color: "#ffffff" }}
                    className="py-2 shadow-none custom-placeholder"
                  />
                </Form.Group>

                {/* BOTTONE ACCEDI */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-100 py-2 border-0 fw-bold d-flex align-items-center justify-content-center gap-2 mt-2"
                  style={{
                    backgroundColor: "#a855f7",
                    color: "white",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" variant="light" />
                      <span>Accesso in corso...</span>
                    </>
                  ) : (
                    "Accedi"
                  )}
                </Button>
              </Form>

              {/* LINK AL REGISTER */}
              <div className="mt-4 pt-2 border-top border-secondary border-opacity-10 small text-white-50">
                Non hai ancora un account?{" "}
                <Link to="/register" style={{ color: "#a855f7", textDecoration: "none" }} className="fw-semibold">
                  Registrati qui
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
