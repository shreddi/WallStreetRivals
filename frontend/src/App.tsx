import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'\
import axios from 'axios';
import './App.css'

// function App() {
//   const [count, setCount] = useState(0)
  
//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
      axios.get('http://localhost:8000/api/hello/')
          .then(response => {
            setMessage(response.data.message)
          })
          .catch(error => {
            console.error('Error fetching data:', error)
          })
  }, []);

  return <div>{message}</div>;
}

export default App
