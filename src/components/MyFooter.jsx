import { Container } from "react-bootstrap";

const MyFooter = () => {
  return (
    <footer
      className="mt-auto py-4"
      style={{
        background: "#111827",
        borderTop: "1px solid rgba(168, 85, 247, 0.25)",
      }}
    >
      <Container className="text-center">
        <p
          className="mb-1"
          style={{
            color: "#9CA3AF",
            fontSize: "0.9rem",
          }}
        >
          © {new Date().getFullYear()}{" "}
          <span
            style={{
              color: "#c084fc",
              fontWeight: "bold",
            }}
          >
            Trackfolio
          </span>
        </p>

        <small
          style={{
            color: "#6B7280",
          }}
        >
          Gestisci film, serie TV, anime e videogiochi in un solo posto.
        </small>
      </Container>
    </footer>
  );
};

export default MyFooter;
