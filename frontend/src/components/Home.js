import React from 'react'
import { Link } from 'react-router-dom'
// import axios from 'axios'
// import moment from 'moment'

const Home = () => {
  return (
    <div className='home-container'>
      <video autoPlay loop src='https://i.imgur.com/sKvcjpH.mp4'></video>
      <div className="home-text">
        <h1> HONNE <br /> <span> 本音 </span></h1>
        <h4></h4>
        <h6> (n.) what a person truly believes; the behaviour and opinions which are often
          kept hidden.</h6>
      </div>

      <div className="login">
        <Link to='/register'> <button>Register</button> </Link>
        <Link to='/login'> <button>Login </button> </Link>
        
      </div>

    </div>


  )
}

export default Home