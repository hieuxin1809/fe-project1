import { Container } from "@mui/material";
import { Board } from "./pages/Boards/_id";
import Header from "./pages/Header/Header";
import { useState } from "react";

function App() {
  const [boardId, setBoardId] = useState();
  const [board, setBoard] = useState(null);

  return (
    <>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          background: "#8f3f65",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header setBoardId={setBoardId} setBoard={setBoard} board={board} />
        <Board
          boardId={boardId}
          setBoard={setBoard}
          board={board}
          setBoardId={setBoardId}
        />
      </Container>
    </>
  );
}

export default App;
