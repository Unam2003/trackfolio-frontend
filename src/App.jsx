import "./App.css";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyNav from "./components/MyNav";
import MyFooter from "./components/MyFooter";
import Home from "./components/Home";
import Esplora from "./components/Esplora";
import Trackfolio from "./components/Trackfolio";
import GamesHome from "./components/GamesHome";
import GameDetails from "./components/GameDetails";
import MyGameCollection from "./components/MyGameCollection";
import Login from "./components/Login";
import Register from "./components/Register";
import Profilo from "./components/Profilo";
import Details from "./components/Details";
import ActorDetails from "./components/ActorDetails";
import SearchResults from "./components/SearchResults";

const App = function () {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100 text-white" style={{ backgroundColor: "#090a0f" }}>
        <MyNav searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="flex-grow-1">
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Pagina con i caroselli dei media */}
            <Route path="/esplora" element={<Esplora />} />

            {/* Pagina con i miei media */}
            <Route path="/trackfolio" element={<Trackfolio />} />

            {/* Pagina dei videogiochi */}
            <Route path="/games" element={<GamesHome searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
            <Route path="/details/game/:id" element={<GameDetails />} />
            <Route path="/my-games" element={<MyGameCollection />} />

            {/* Autenticazione */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profilo" element={<Profilo />} />

            {/* Risultati di ricerca */}
            <Route path="/search" element={<SearchResults />} />

            {/* Dettagli (Film, Serie, Anime, Giochi) */}
            <Route path="/details/:type/:id" element={<Details />} />
            <Route path="/actor/:id" element={<ActorDetails />} />
          </Routes>
        </main>

        <MyFooter />
      </div>
    </BrowserRouter>
  );
};

export default App;
