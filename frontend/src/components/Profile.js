import React, { useState, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment'
import Navbar from './Navbar'
import auth from './lib/auth'
import { Link } from 'react-router-dom'
import Header from './Header'
import { TimelineLite, Power2 } from 'gsap'


const Profile = (props) => {

  const [data, setData] = useState({
    images: [{
      picture: ''
    }]
  })

  useEffect(() => {
    axios.get(`/api/users/${props.match.params.id}`)
      .then(res => {
        setData(res.data)
        console.log(res.data)
      })
  }, [props.match.params.id])

  const HandleLogout = () => {
    auth.logOut()
    props.history.push('/')
  }

  let count = 1
  let currentPosition = 0

  const HandleSlide = (e) => {
    const slides = Array.from(document.querySelectorAll('.slides'))
    // const container = document.querySelector('.slideshow')
    const size = slides[0].clientWidth
    const t1 = new TimelineLite

    if (e.target.id === 'right') {
      if (count === data.images.length) {
        return
      }
      // container.style.transform = `translateX(-${size * count}px)`
      t1.to('.slideshow', 0.1, { filter: 'blur(3.5px)' })
        .to('.slideshow', 0.1, { transform: `translateX(-${size * count}px)` })
        .to('.slideshow', 0.15, { filter: 'blur(0)' }, '+=0.1')
      count++
      currentPosition += size
      console.log(count)
    } else {
      if (count === 1) {
        return
      }
      // container.style.transform = `translateX(-${currentPosition - size}px)`
      t1.to('.slideshow', 0.1, { filter: 'blur(3.75px)' })
        .to('.slideshow', 0.1, { transform: `translateX(-${currentPosition - size}px)` })
        .to('.slideshow', 0.15, { filter: 'blur(0)' }, '+=0.1')
      count--
      currentPosition -= size
    }
  }

  return (
    <>
      {auth.getUserId() === parseInt(props.match.params.id) ?
        // IF IT IS YOUR ACCOUNT
        <div style={{ justifyContent: 'center' }} className='profile-container'>

          <div className='profile-image'>
            <img src={data.images.length === 0 ? 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png' : data.images[0].picture.replace('8001', '8000')} />
          </div>

          <div style={data.date_of_birth ? null : { 'justifyContent': 'center' }} className='profile-info'>
            <h1> {data.first_name}, </h1>
            <h2> {data.date_of_birth ? moment().diff(data.date_of_birth, 'years') : null} </h2>
          </div>

          <div className='media-settings'>


            <Link to={`/user/${data.id}/settings`}>
              <div className='settings'>
                <ion-icon name="settings-outline"></ion-icon>
                <div className="text">
                  <h2> Settings </h2>
                  <h5> View your discovery settings</h5>
                </div>
              </div>
            </Link>


            <Link to={`/user/${data.id}/media`}>
              <div className='settings'>
                <ion-icon name="camera-outline"></ion-icon>
                <div className="text">
                  <h2> Media </h2>
                  <h5> Add up to 6 images </h5>
                </div>

              </div>
            </Link>

            <Link to={`/user/${data.id}/info`}>
              <div className='settings'>
                <ion-icon name="pencil-outline"></ion-icon>
                <div className="text">
                  <h2> Account Preview </h2>
                  <h5> See what others see </h5>
                </div>

              </div>
            </Link>

            <div onClick={() => HandleLogout()} className='logout'>
              <h2> Log Out </h2>
            </div>
          </div>
        </div>
        :


        // ANOTHER USERS ACCOUNT 
        <div className='profile-container'>
          <div className="other-user-picture">
            <div className="slideshow">
              {data.images.length === 0 ? <img style={{ height: '93%', width: '100%' }} src='https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png' />
                : (data.images.map((el, i) => {
                  return (
                    <div key={i} className="slides">
                      <img src={el.picture.replace('8001', '8000')} />
                    </div>)
                }))
              }
            </div>
          </div>

          <div className="other-user-info">
            {data.images.length === 0 ? null :
              <div className="icons">
                <ion-icon id='left' onClick={(e) => HandleSlide(e)} name="arrow-back-circle"></ion-icon>
                <ion-icon id='right' onClick={(e) => HandleSlide(e)} name="arrow-forward-circle"></ion-icon>
              </div>}
            <div className="text">
              <h1> {data.first_name}, <span>{data.date_of_birth ? moment().diff(data.date_of_birth, 'years') : null}  </span></h1>
              <small> Last active: {data.last_login === null ? 'a while ago...' : moment(data.last_login).fromNow()} </small>
              <div>
                <h2> {data.occupation ? data.occupation : ''} </h2>
                <p> {data.bio ? data.bio : ''} </p>  
              </div>
            </div>

          </div>
        </div>


      }
      <Header />
      <Navbar />

    </>
  )
}

export default Profile