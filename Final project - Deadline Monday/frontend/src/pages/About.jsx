import { useState } from 'react';

function About() {
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Good luck!');
  const [attemptsLeft, setAttemptsLeft] = useState(10);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [secretNumber] = useState(Math.floor(Math.random() * 100) + 1);

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) {
      setMessage('Enter a number between 1 and 100.');
      return;
    }

    if (attemptsLeft <= 0 || gameOver) return;

    const newGuesses = [...guesses, num];
    setGuesses(newGuesses);
    setAttemptsLeft(attemptsLeft - 1);

    if (num === secretNumber) {
      setMessage(`Correct! The number was ${secretNumber}.`);
      setGameOver(true);
    } else if (attemptsLeft === 1) {
      setMessage(`Game over. The number was ${secretNumber}.`);
      setGameOver(true);
    } else {
      const diff = Math.abs(num - secretNumber);
      let hint = num < secretNumber ? 'Too low' : 'Too high';
      if (diff <= 3) hint += ' — very close!';
      else if (diff <= 10) hint += ' — close.';
      setMessage(hint);
    }
    setGuess('');
  };

  const restartGame = () => {
    setGuess('');
    setMessage('Good luck!');
    setAttemptsLeft(10);
    setGuesses([]);
    setGameOver(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleGuess();
  };

  return (
    <div>
      <section>
        <div className="container">
          <h1>About Me</h1>
          <p>A Passionate Student Leader, Athlete, and Creative Artist All the way from the province of La Union!</p>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>What I Love About My Craft</h2>
          <p>My passion for video editing, photography, and graphic design stems from my desire to tell stories and capture moments that matter. Every frame, every transition, and every color choice is an opportunity to express creativity and connect with audiences on a deeper level. Whether I'm editing a highlight reel, composing a photograph, or designing a layout, I find joy in transforming ideas into visual masterpieces. The intersection of technology and artistry allows me to push boundaries and create work that inspires and engages.</p>
          <div className="image-card">
            <img src="/Photowalk.jpg" alt="Edvir's Photo" className="section-image" />
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>My Journey & Milestones</h2>
          <p>My path has been filled with growth, achievements, and meaningful experiences. Here's a timeline of my key milestones and experiences:</p>
          <ol>
            <li><strong>Discovery Phase:</strong> Started exploring photography and videography as a hobby during my early years in college</li>
            <li><strong>Skill Development:</strong> Took formal courses in video editing, Adobe Creative Suite, and graphic design fundamentals</li>
            <li><strong>Leadership Role:</strong> Became a student leader, guiding and mentoring others with determination and passion</li>
            <li><strong>Athletic Achievement:</strong> Represented DMMMSU in SCUAA 2024, showcasing dedication beyond academics</li>
            <li><strong>National Recognition:</strong> Competed in the Philippine National Games 2023 at the Rizal Memorial Complex</li>
            <li><strong>Portfolio Growth:</strong> Built a diverse portfolio of video productions, photography series, and design projects</li>
            <li><strong>Sharing My Story:</strong> Launched this platform to inspire others and showcase my journey to the world</li>
          </ol>

          <h2>SCUAA 2024 Highlights</h2>
          <div className="image-card">
            <img src="/TKD.jpg" alt="Edvir's Taekwondo Highlights" className="section-image" />
          </div>

          <h2>The Photographer</h2>
          <div className="image-card">
            <img src="/Photographer.jpg" alt="Edvir's as Photographer" className="section-image" />
          </div>

          <h2>My Artwork</h2>
          <div className="image-card">
            <img src="/Photo1.jpg" alt="Artwork" className="section-image" />
          </div>
          <div className="image-card">
            <img src="/Photo2.jpg" alt="Artwork" className="section-image" />
          </div>
          <div className="image-card">
            <img src="/Photo 3.jpg" alt="Artwork" className="section-image" />
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <blockquote>
            <p>"The only way to do great work is to love what you do." - Steve Jobs</p>
            <p style={{ marginTop: '15px' }}>"Creativity is intelligence having fun." - Albert Einstein</p>
          </blockquote>
        </div>
      </section>

      <section id="mini-game" aria-labelledby="mini-game-title">
        <h2 id="mini-game-title">Play: Guess the Number</h2>
        <p className="instructions">I'm thinking of a number between <strong>1</strong> and <strong>100</strong>. You have <span id="max-attempts">{10}</span> attempts.</p>

        <div className="game-controls">
          <input
            id="guess-input"
            type="number"
            min="1"
            max="100"
            placeholder="Enter your guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={gameOver}
          />
          <button id="guess-btn" className="btn" onClick={handleGuess} disabled={gameOver}>Guess</button>
          <button id="restart-btn" className="btn secondary" onClick={restartGame}>Restart</button>
        </div>

        <div id="message" className="game-message">{message}</div>
        <div className="game-status">
          Attempts left: <span id="attempts-left">{attemptsLeft}</span> — Your guesses: <span id="guesses">{guesses.length ? guesses.join(', ') : '—'}</span>
        </div>
      </section>
    </div>
  );
}

export default About;