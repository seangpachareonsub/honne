import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'



// COMPONENTS
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Profile from './components/Profile'
import Swipe from './components/Swipe'
import Settings from './components/Settings'
import Messages from './components/MessageList'
import Chat from './components/Chat'
import ProfileSetup from './components/ProfileSetup'
import AnswerQuestions from './components/AnswerQuestions'
import Media from './components/Media'
import Explore from './components/Explore'
import Info from './components/Info'

// STYLES
import 'bulma'
import './styles/style.scss'


import auth from './components/lib/auth'
import axios from 'axios'
import moment from 'moment'




const App = () => {

  const [mobileSize, setMobileSize] = useState(false)
  const width = document.querySelector('#root')

  function reportWindowSize() {
    window.innerWidth < 400 ? setMobileSize(true) : setMobileSize(false)
  }

  useEffect(() => {
    window.innerWidth < 400 ? setMobileSize(true) : null
    window.onresize = reportWindowSize
  }, [])


  return (

    mobileSize ?

      <Router>
        <Switch>
          <Route exact path='/' component={Home}></Route>
          <Route exact path='/register' component={Register}></Route>
          <Route exact path='/login' component={Login}></Route>
          <Route exact path='/user/setup' component={ProfileSetup}></Route>
          <Route exact path='/user/:id' component={Profile}></Route>
          <Route exact path='/user/:id/media' component={Media}></Route>
          <Route exact path='/user/:id/settings' component={Settings}></Route>
          <Route exact path='/user/:id/questions' component={AnswerQuestions}></Route>
          <Route exact path='/user/:id/info' component={Info}></Route>
          <Route exact path='/swipe' component={Swipe}></Route>
          <Route exact path='/messages' component={Messages}></Route>
          <Route exact path='/message/:id' component={Chat}></Route>
          <Route exact path='/explore' component={Explore}></Route>
        </Switch>
      </Router>

      :
      <div className='screen-error'>
        <h1> HONNE </h1>
        <p> Unfortunately, this application is not yet supported for desktop view.
          For optimal user experience, please open on an iPhone X or Google Chrome Developer
          Tools under the iPhone X screen sizing.
        </p>

        <p>
          <br />
          Google Dev Tools:
          <ul>
            <li> Ensure that you are currently using Google Chrome </li>
            <li> Right click on mouse/trackpad anywhere on this page </li>
            <li> Select the 'Inspect' option </li>
            <li> Select the tablet/mobile device icon on the top right hand side</li>
            <li> Select the iPhone X option from the drop down list of device views </li>
          </ul>
        </p>

      </div>

  )



}

// const data = []

// let i = 1
// const Data = () => {
//   useEffect(() => {
//     data.map(el => {
//       const body = { occupation: el.occupation, bio: el.bio }
//       axios.patch(`/api/users/${i}/`, body)
//       i++
//     })
//   })

//   return (
//     <h1> hello </h1>
//   )
// }




ReactDOM.render(
  <App />,
  document.getElementById('root')
)
