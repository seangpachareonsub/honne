import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

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


const App = () => {
  return (
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
        <Route exact path='/explore' component={Explore}></Route>
        <Route exact path='/message/:id' component={Chat}></Route>
      </Switch>
    </Router>
  )
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
)
