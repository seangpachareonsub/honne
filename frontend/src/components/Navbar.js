import React from 'react'
import { Link } from 'react-router-dom'
import auth from './lib/auth'

const Navbar = (props) => {

  return (
    <nav>
      <Link to='/swipe'>
        <div>
          <ion-icon name="eye-off-sharp"></ion-icon>
          <h5> Honne </h5>
        </div>
      </Link>

      <Link to='/messages'>
        <div>
          <ion-icon name="chatbubbles-sharp"></ion-icon>
          <h5> Messages </h5>
        </div>
      </Link>

      <Link to='/explore'>
        <div>
          <ion-icon name="compass-sharp"></ion-icon>
          <h5> Explore </h5>
        </div>
      </Link>

      <Link to={`/user/${auth.getUserId()}`}>
        <div>
          <ion-icon name="person-sharp"></ion-icon>
          <h5> Profile </h5>
        </div>
      </Link>

    </nav >

  )
}

export default Navbar
