import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import "./App.css"
import heartIcon from "./assets/heart.svg";
import diamondIcon from "./assets/diamond.svg";
import spadeIcon from "./assets/spade.svg";
import clubIcon from "./assets/club.svg";

const socket = io("https://poker-backend-q59w.onrender.com/")

function App() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [displayRoom, setDisplayRoom] = useState("");
  const [game, setGame] = useState(null);
  const [showRaiseOptions, setShowRaiseOptions] = useState(false);
  const [betAmount, setBetAmount] = useState(0);

  useEffect(() => {
    socket.on('update-game', updatedGame => {
      setGame(updatedGame);
      console.log(updatedGame)
    });

    return () => socket.off('update-game'); // Cleanup listener on unmount
  }, []);

  const joinRoom = () => {
    socket.emit('join-room', room, name, room => {
      setDisplayRoom(room)
    })
  }

  const startGame = () => {
    if (game.players.length < 2) {
      alert("At least 2 players needed.")
    }
    socket.emit("start-game", room);
  };

  const bet = (amount) => {
    if (game && game.started && socket) {
      socket.emit('bet', displayRoom, amount, socket.id);
    }
  };

  const fold = () => {
    if (game && game.started && socket) {
      socket.emit('fold', displayRoom, socket.id)
    }
  }

  const toilet = [
    { left: "50%", top: "80%" },   // 1
    { left: "24.1%", top: "80%" }, // 2
    { left: "75.9%", top: "80%" }, // 3
    { left: "6%", top: "58%" },    // 4
    { left: "94%", top: "58%" },   // 5
    { left: "6%", top: "4%" },     // 6
    { left: "94%", top: "4%" },    // 7
    { left: "24.1%", top: "-18%" },// 8
    { left: "75.9%", top: "-18%" } // 9
  ];

  const skibidi = [
    { left: "50%", top: "80%", transform: "translate(-50%, -500%)" },   // 1
    { left: "24.1%", top: "80%", transform: "translate(-50%, -500%)" }, // 2
    { left: "75.9%", top: "80%", transform: "translate(-50%, -500%)" }, // 3
    { left: "6%", top: "58%", transform: "translate(-50%, -500%)" },    // 4
    { left: "94%", top: "58%", transform: "translate(-50%, -500%)" },   // 5
    { left: "6%", top: "4%", transform: "translate(-50%, -500%)" },     // 6
    { left: "94%", top: "4%", transform: "translate(-50%, -500%)" },    // 7
    { left: "24.1%", top: "-18%", transform: "translate(-50%, -500%)" },// 8
    { left: "75.9%", top: "-18%", transform: "translate(-50%, -500%)" } // 9
  ];

  const seatPositionsMap = {
    2: [
      { left: "50%", top: "80%" },   // Player 1
      { left: "24.1%", top: "80%" }, // Player 2
    ],
    3: [
      { left: "75.9%", top: "80%" }, 
      { left: "50%", top: "80%" },
      { left: "24.1%", top: "80%" },
    ],
    4: [
      { left: "75.9%", top: "80%" }, 
      { left: "50%", top: "80%" },
      { left: "24.1%", top: "80%" },
      { left: "6%", top: "58%" },
    ],
    5: [
      { left: "94%", top: "58%" },   // 5
      { left: "75.9%", top: "80%" }, 
      { left: "50%", top: "80%" },
      { left: "24.1%", top: "80%" },
      { left: "6%", top: "58%" }, 
    ],
  };
  
  const betDisplayPositionsMap = {
    2: [
      { left: "50%", top: "80%", transform: "translate(-50%, -500%)" },
      { left: "24.1%", top: "80%", transform: "translate(-50%, -500%)" },
    ],
    3: [
      { left: "75.9%", top: "80%", transform: "translate(-50%, -500%)" }, 
      { left: "50%", top: "80%", transform: "translate(-50%, -500%)" },
      { left: "24.1%", top: "80%", transform: "translate(-50%, -500%)" },
    ],
    4: [
      { left: "75.9%", top: "80%", transform: "translate(-50%, -500%)" },
      { left: "50%", top: "80%", transform: "translate(-50%, -500%)" },
      { left: "24.1%", top: "80%", transform: "translate(-50%, -500%)" },
      { left: "6%", top: "58%", transform: "translate(-50%, -500%)" },
    ],
    5: [
      { left: "94%", top: "58%", transform: "translate(-50%, -500%)" },   // 5
      { left: "75.9%", top: "80%", transform: "translate(-50%, -500%)" },
      { left: "50%", top: "80%", transform: "translate(-50%, -500%)" },
      { left: "24.1%", top: "80%", transform: "translate(-50%, -500%)" },
      { left: "6%", top: "58%", transform: "translate(-50%, -500%)" },
    ],
  };
  

  const suitIcons = {
    "heart": heartIcon,
    "diamond": diamondIcon,
    "spade": spadeIcon,
    "club": clubIcon,
  };

  const getCardColor = (suit) => (suit === 'heart' || suit === 'diamond' ? { color: '#FD5885'} : { color: 'black' });

  const seatPositions = seatPositionsMap[game?.players.length]

  const betDisplayPositions = betDisplayPositionsMap[game?.players.length]

  const me = game?.players?.find(p => p.id === socket.id) || {};
  const isMyTurn = game?.players[game?.currentTurn]?.id === socket.id;
  const playerBet = me.playerBet || 0;
  const isCall = game?.currentBet > playerBet;

  return (
    <div className="main-container">
      {displayRoom ? (
        game && game.started ? (
          // Poker Game UI (when game is started)
          <>
          <div className="blind-display">
            <div className="name-container">Jeux de francais</div>
            <div className="blind-container">$10/$20</div>
          </div>

          <div className="poker-table-container">
            {game?.players.map((player, index) => (
              <>
                {(player.playerBet > 0 && (!game?.showdownOver && !game?.roundOver)) && (
                  <div key={`bet-${player.id}`} style={betDisplayPositions[index]} className="bet-indicator">
                    ${player.playerBet}
                  </div>
                )}
                {(game?.showdownOver || game?.roundOver) && (player.winnings > 0) && (
                  <div key={`bet-${player.id}`} style={betDisplayPositions[index]} className="bet-indicator">
                    + ${player.winnings}
                  </div>
                )}
              <div key={player.id} className="you" style={seatPositions[index]}>
                <div className="spacer">
                  <div className="spacer-spacer" />
                  {player.id === socket.id || (game.showdownOver && !player.hasFolded) ? (
                    // Show the player's actual cards if it's their seat
                    <div className="card-container">
                        <div className="your-card-1-container" style={getCardColor(player.hand[0].suit)}>
                          <div className="your-cards">
                            <h1>{player.hand[0].value}</h1>
                            <img src={suitIcons[player.hand[0].suit]} alt={suitIcons[player.hand[0].suit]} className="your-cards-card" />

                          </div>
                        </div>
                        <div className="your-card-2-container" style={getCardColor(player.hand[1].suit)}>
                          <div className="your-cards">
                            <h1>{player.hand[1].value}</h1>
                            <img src={suitIcons[player.hand[1].suit]} alt={suitIcons[player.hand[1].suit]} className="your-cards-card" />
                          </div>
                        </div>
                    </div>
                  ) : (
                    // Show face-down cards for other players
                    <>
                      <div className="card-1">
                        <div className="innercard-1" />
                      </div>
                      <div className="card-2">
                        <div className="innercard-2" />
                      </div>
                    </>
                  )}
                </div>
                <div className="you-container" style={{
                  backgroundColor: player.hasFolded
                    ? "gray"
                    : player.isAllIn
                    ? "red"
                    : game?.currentTurn === index
                    ? "rgb(80, 158, 188)"
                    : "rgb(0, 100, 0)",
                }}>
                  {index === game?.players.findIndex(p => p.id === game?.dealer) && (
                    <div className="dealer-indicator">
                      <span>D</span>
                    </div>
                  )}
                  <div className="player-name-container">{player.name}</div>
                  <div className="amount-container">${player.chips.toFixed(2)}</div>
                </div>
              </div>
              </>
            ))}

            <div className="poker-table">
              <div className="community-card-container">
                
                <div className="pot-container">
                  <div className="pot">Pot: ${game.pot}</div>
                </div>

                <div className="community-card-container-container">

                  {game.communityCards.slice(0, 5).map((card, index) => (
                    card ? (
                      <div key={index} className="community-card-1">
                        <div className="community-card-2">
                          <div className="community-card-3">
                            <div className="community-card-4">
                              <div className="community-card-5" style={getCardColor(card.suit)}>
                                <h1>{card.value}</h1>
                                <img src={suitIcons[card.suit]} alt={suitIcons[card.suit]} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div color="#fd5855" className="individual-community-card-container">
                        <div key={index} className="individual-community-card"></div>
                      </div>
                    )
                  ))}

                </div>
              </div>
            </div>
          </div>



          <div className="options-container-1">
            {showRaiseOptions ? (
              <div className="raise-container">
                <div className="raise-confirm-button">
                  <div className="individual-option-container">
                  <button disabled={!isMyTurn || game.roundOver || game.showdownOver} onClick={() => {bet(betAmount); setShowRaiseOptions(false);}} className="option-button">
                    Bet
                  </button>                    
                  </div>
                  <div className="individual-option-container">
                  <button disabled={!isMyTurn || game.roundOver || game.showdownOver}onClick={() => setShowRaiseOptions(false)} className="option-button">
                    Cancel
                  </button>                    
                  </div>

                </div>
                <div className="raise-slider">
                  <div className="bet-raise-display-container">
                    <input
                      type="number"
                      value={betAmount}
                      min={game.currentBet - me.playerBet}
                      max={me.chips}
                      onChange={(e) => {
                        let newValue = Number(e.target.value);
                        if (newValue >= game.currentBet && newValue <= me.chips) {
                          setBetAmount(newValue);
                        }
                      }}
                      className="bet-amount-input"
                      disabled={!isMyTurn || game.roundOver || game.showdownOver}
                    />
                  </div>
                    <input
                      type="range"
                      min={game.currentBet}
                      max={me.chips}
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="slider"
                      disabled={!isMyTurn || game.roundOver || game.showdownOver}
                    />
                  </div>
              </div>
            ) : (
              <div className="options-container-2">
                <div className="individual-option-container">
                  <button onClick={() => setShowRaiseOptions(true)} className="option-button" disabled={!isMyTurn || game.roundOver || game.showdownOver}>
                    Raise
                  </button>
                </div>
                <div className="individual-option-container">
                {isCall ? (
                  <button
                    onClick={() => bet(Math.min(game.currentBet - playerBet, me.chips))}
                    className="option-button"
                    disabled={!isMyTurn || game.roundOver || game.showdownOver}
                  >
                    Call ${Math.min(game.currentBet - playerBet, me.chips)}
                  </button>
                ) : (
                  <button
                    onClick={() => bet(0)}
                    className="option-button"
                    disabled={!isMyTurn || game.roundOver || game.showdownOver}
                  >
                    Check
                  </button>
                )}
                </div>
                <div className="individual-option-container">
                  <button onClick={() => fold()} className="option-button" disabled={!isMyTurn || game.roundOver || game.showdownOver}>
                    Fold
                  </button>
                </div>
              </div>
            )}
          </div>


          </>
        ) : (
          // Waiting Room UI (before game starts)
          <div className="waiting-room-container">
            <h2 className="waiting-room-text-container">Waiting Room - {displayRoom}</h2>
            <div className="player-list-container">
              <p>Players: {game?.players.length || 0}</p>
            </div>
            
            {game && game.players[0].id === socket.id && (
              <div className="start-game-button-container">
                <button
                  onClick={startGame}
                >
                  Start Game
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        // Join Room UI
        <div className="join-room-container">
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room"
            className="join-room-input"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="join-room-input"
          />
          <div className="join-room-button-container">
            <button
              onClick={joinRoom}
              className="join-room-button"
              >
              Join
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
}

export default App