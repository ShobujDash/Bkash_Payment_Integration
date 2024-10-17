import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './components/Home'
import Success from './components/Success'
import Error from './components/Error'


const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <Home/>} />
          <Route path='/error?' element={ <Error/>} />
          <Route path='/success' element={ <Success/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
