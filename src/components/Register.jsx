import { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [successo, setSuccesso] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrore("");
    setSuccesso(false);

    // Definizione della Regex identica al backend Java
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{4,}$/;

    // Validazione preventiva lato Client
    if (!passwordRegex.test(form.password)) {
      setErrore("La password deve contenere almeno 4 caratteri, inclusa una lettera maiuscola, una minuscola e un numero.");
      return;
    }

    setLoading(true);

    fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name.trim(),
        surname: form.surname.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      }),
    })
      .then((res) => {
        if (res.ok) {
          setSuccesso(true);
          setLoading(false);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          throw new Error(`Errore nella registrazione: ${res.status}`);
        }
      })
      .catch((err) => {
        console.error("Errore durante la registrazione:", err);
        setErrore("Impossibile registrarsi. Controlla i dati o riprova più tardi.");
        setLoading(false);
      });
  };

  const inputStyle = {
    backgroundColor: "#1a1f2c",
    border: "1px solid #2d3548",
    color: "#ffffff",
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#0b0d12" }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5} xl={4}>
            <div
              className="p-4 p-sm-5 rounded-4 shadow-lg text-white text-center"
              style={{
                backgroundColor: "#12151c",
                border: "1px solid #232936",
              }}
            >
              {/* BRAND LOGO */}
              <h1
                className="mb-2 fw-bold"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 32,
                  letterSpacing: "1px",
                  background: "linear-gradient(45deg, #a855f7, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                TRACKFOLIO
              </h1>
              <p className="text-white-50 small mb-4">Crea un account per iniziare a tracciare i tuoi contenuti</p>

              {/* STATI ALERT */}
              {errore && (
                <Alert variant="danger" className="py-2 small bg-dark text-danger border-danger mb-3 text-start">
                  {errore}
                </Alert>
              )}
              {successo && (
                <Alert variant="success" className="py-2 small bg-dark text-success border-success mb-3">
                  Registrazione completata! Reindirizzamento...
                </Alert>
              )}

              {/* FORM CONTROLS */}
              <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3 text-start">
                <Row className="g-2">
                  <Col xs={12} sm={6}>
                    <Form.Group>
                      <Form.Label className="small text-white-50 ps-1">Nome</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Es: Mario"
                        value={form.name}
                        onChange={handleChange("name")}
                        style={inputStyle}
                        className="py-2 shadow-none custom-login-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Group>
                      <Form.Label className="small text-white-50 ps-1">Cognome</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Es: Rossi"
                        value={form.surname}
                        onChange={handleChange("surname")}
                        style={inputStyle}
                        className="py-2 shadow-none custom-login-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label className="small text-white-50 ps-1">Indirizzo Email</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder="mario.rossi@esempio.it"
                    value={form.email}
                    onChange={handleChange("email")}
                    style={inputStyle}
                    className="py-2 shadow-none custom-login-input"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small text-white-50 ps-1">Password</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange("password")}
                    style={inputStyle}
                    isInvalid={errore && errore.includes("password")}
                    className="py-2 shadow-none custom-login-input"
                  />
                  <Form.Control.Feedback type="invalid" className="small ps-1">
                    La password richiede almeno 4 caratteri, una maiuscola, una minuscola e un numero.
                  </Form.Control.Feedback>
                </Form.Group>

                {/* BOTTONE REGISTRATI */}
                <Button
                  type="submit"
                  disabled={loading || successo}
                  className="w-100 py-2 border-0 fw-bold d-flex align-items-center justify-content-center gap-2 mt-2"
                  style={{
                    backgroundColor: "#a855f7",
                    color: "white",
                    borderRadius: 6,
                    transition: "0.2s",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" variant="light" />
                      Creazione account...
                    </>
                  ) : (
                    "Registrati"
                  )}
                </Button>
              </Form>

              {/* LINK AL LOGIN */}
              <div className="mt-4 pt-2 border-top border-secondary border-opacity-10 small text-white-50">
                Hai già un account?{" "}
                <Link to="/login" style={{ color: "#a855f7", textDecoration: "none" }} className="fw-semibold hover-link">
                  Accedi qui
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
