import React, { useState, useEffect } from 'react';

function NameForm(props) {
  const [name, setName] = useState('');
  const [userExists, setUserExists] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    props.onSubmit(name);
  }
  
  function handleChange(event) {
    setName(event.target.value);
  }
  useEffect(() => {
    if (name) {
      fetch(`http://localhost:5000/users?name=${encodeURIComponent(name)}`)
        .then(response => response.json())
        .then(data => setUserExists(data.exists))
        .catch(error => console.error(error));
    }
  }, [name]);

  return (
    <div className="w3-display-middle" style={{backgroundColor: "white", borderRadius:"15px"}}>
  <form onSubmit={handleSubmit} className="w3-container w3-card-4 w3-round-large w3-theme-l5 w3-padding-32" style={{backgroundColor: "white"}}>
    <h2 className="w3-center w3-text-theme">Enter your name to start the Quiz!</h2>
    <label className="w3-label w3-text-theme">
      Your Name:
      <input type="text" value={name} onChange={handleChange} className="w3-input w3-border w3-round-large" />
    </label>
    {userExists && <p className="w3-text-red">User already exists in the database.</p>}
    <button className="w3-button w3-theme-dark w3-margin-top w3-round-large w3-text-white" style={{backgroundColor: "black"}} type="submit" disabled={!name || userExists}>
      Start Quiz
    </button>
  </form>
</div>


  );
}

function App() {
  const [questions, setQuestions] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [userName, setUserName] = useState(null);
  const [pname, setPlayersName] = useState('');
  function stringInArray(str) {
    for (let i = 0; i < pname.length; i++) {
      if (pname[i]._id === str) {
        return "Welcome Back " + str;
      }
    }
    return "Welcome " + str;  
  }
  useEffect(() => {
    fetch('http://localhost:5000/users/nameofuser')
    .then(response => response.json()).then(data => setPlayersName(data)).catch(error => console.error(error));
  }, []);
  useEffect(() => {
    fetch('http://localhost:5000/questions')
    .then(response => response.json()).then(data => setQuestions(data)).catch(error => console.error(error));
  }, []);
  useEffect(() => {
    fetch('http://localhost:5000/users/most-correct-answers')
    .then(response => response.json()).then(data => setTopPlayers(data)).catch(error => console.error(error));
  }, []);
  function handleOptionSelect(option) { setSelectedOption(option);}
  function handleAnswerSubmit() { if (selectedOption && selectedOption.isCorrect) { setScore(score + 1);}
    setSelectedOption(null);
    if (currentQuestion === questions.length - 1) { setCompleted(true);} 
    else { setCurrentQuestion(currentQuestion + 1);}}
  function handleQuizReset() { 
    const data = { name: userName, totalQuestionsAnswered: questions.length, totalCorrectAnswers: score };
    fetch('http://localhost:5000/users', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(data) 
    })
    .then(response => response.json()).then(result => console.log(result)).catch(error => console.error(error));
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setCompleted(false);
    setUserName(null);
  }
  useEffect(() => { if (questions.length > 0 && currentQuestion === null) { setCurrentQuestion(0);}}, [questions, currentQuestion]);
  if (!userName) { return (
    <div className='w3-container'>
      <h3 className='w3-center w3-text-theme w3-monoscope w3-animate-fading w3-text-white'>Welcome to</h3>
    <h1 className='w3-center w3-jumbo w3-text-theme w3-monoscope w3-animate-fading w3-text-white'>STAR WARS TRIVIA!</h1>
    <div className='w3-card-4 w3-round-large w3-theme-l5 w3-padding-32'>
      <NameForm onSubmit={name => setUserName(name)} />
    </div>
  </div>
  );}
  if (!questions.length || currentQuestion === null) { return <div>Loading...</div>;}
  const current = questions[currentQuestion];
  if (completed) {
    return (
      <div className='w3-container w3-center w3-padding-64 w3-theme-dark'style={{ width: '65%', height: '65%', margin: 'auto' }}>
      <h1 className='w3-text-yellow w3-bold w3-jumbo'>Quiz Completed!</h1>
      <div className='w3-white' style={{ width: '50%', height: '45%', margin: 'auto', borderRadius: '25px' }}><br></br>
      <p className='w3-text-black w3-large'>{userName}!! you got a score of: {Math.trunc(score / questions.length *100)}%</p>
      <button className='w3-button w3-black w3-border w3-round-large w3-margin-top w3-hover-opacity' onClick={handleQuizReset}>Restart Quiz</button>
      <br></br><br></br><br></br><br></br></div>
      <h2 className='w3-text-white'>Top 3 Players</h2>
      <ul className='w3-center-align w3-ul w3-border w3-white w3-margin-bottom w3-card-4 w3-round-large' style={{ maxWidth: '300px', margin: '0 auto' }}>
        {topPlayers.slice(0, 3).map((player, index) => (
          <li key={player._id} className='w3-center-align'>
            {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : '🥉 '}<br></br>
            {player._id} <br></br> {player.totalCorrectAnswers} total correct answers
          </li>
        ))}
      </ul>
      <br></br>
    </div>
    );}
  return (
    <div className='w3-container w3-center w3-padding-64 w3-theme-dark'>
  <h1 className='w3-text-white w3-monospace w3-animate-zoom'>Star Wars Trivia</h1>
  <h3 className='w3-text-white w3-monospace'>{stringInArray(userName)}!!</h3>
  <div className='w3-container w3-card-4 w3-padding-32' style={{ maxWidth: '600px', margin: '0 auto' }}>
    <h2 className='w3-text-white'>Question {currentQuestion + 1} Out Of {questions.length}</h2>
    <p className='w3-text-white w3-large'>{current.quest}</p>
    {current.options.map(option => (
      <div key={option.id} className='w3-margin-top'>
        <button className='w3-button w3-black w3-border w3-round-large w3-margin-right w3-margin-bottom' style={{ width: '100%' }} onClick={() => handleOptionSelect(option)}>
          {option.text}
        </button>
      </div>
    ))}
    <button className='w3-button w3-black w3-border w3-round-large w3-margin-top w3-hover-opacity' onClick={handleAnswerSubmit} disabled={!selectedOption}>Submit Answer</button>
  </div>
  <div className='w3-text-white w3-monoscope w3-large'><p>{score} / {currentQuestion} Questions Correct</p></div>
</div>



    );
}
export default App;

