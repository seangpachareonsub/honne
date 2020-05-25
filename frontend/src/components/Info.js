import { TimelineLite } from 'gsap'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import auth from './lib/auth'
import Header from './Header'
import Navbar from './Navbar'

const Info = (props) => {

  const [data, setData] = useState({
    images: [{
      picture: ''
    }]
  })

  const [form, setForm] = useState({
    bio: '',
    occupation: ''
  })

  useEffect(() => {
    axios.get(`/api/users/${auth.getUserId()}/`)
      .then(res => {
        setData(res.data)
        if (res.data.bio) { 
          setForm({ bio: res.data.bio, occupation: res.data.occupation })
        } else {
          setForm({ bio: 'Write about yourself here...', occupation: 'Add your job title' })
        }
        
      })
  }, [])


  let count = 1
  let currentPosition = 0

  const HandleSlide = (e) => {
    const slides = Array.from(document.querySelectorAll('.slides'))
    const size = slides[0].clientWidth
    const t1 = new TimelineLite

    if (e.target.id === 'right') {
      if (count === data.images.length) {
        return
      }
      t1.to('.slideshow', 0.1, { filter: 'blur(3.5px)' })
        .to('.slideshow', 0.1, { transform: `translateX(-${size * count}px)` })
        .to('.slideshow', 0.15, { filter: 'blur(0)' }, '+=0.1')
      count++
      currentPosition += size
    } else {
      if (count === 1) {
        return
      }
      t1.to('.slideshow', 0.1, { filter: 'blur(3.75px)' })
        .to('.slideshow', 0.1, { transform: `translateX(-${currentPosition - size}px)` })
        .to('.slideshow', 0.15, { filter: 'blur(0)' }, '+=0.1')
      count--
      currentPosition -= size
    }
  }


  const HandleChange = (e) => {
    e.target.id === 'job' ? setForm({ occupation: e.target.value, bio: form.bio })
      : setForm({ occupation: form.occupation, bio: e.target.value })
  }

  const HandleSubmit = (e) => {
    e.preventDefault()
    axios.patch(`/api/users/${auth.getUserId()}/`, form)
    props.history.goBack()
  }

  return (
    <>
      <div className="info-container">
        <Header />
        <Navbar />
       
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
            
            <form onSubmit={(e) => HandleSubmit(e)} onChange={(e) => HandleChange(e)} action="">
              <button> Save </button>
              <input autoComplete='off' id='job' value={form.occupation} type="text" />
              <textarea autoComplete='off' id='bio' maxLength='200' value={form.bio} type="text" />
            </form>
          </div>

        </div>
      </div>

    </>
  )

}

export default Info