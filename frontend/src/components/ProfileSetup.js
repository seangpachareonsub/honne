import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Header from './Header'
import auth from './lib/auth'
import { TimelineLite, gsap, CSSPlugin } from 'gsap'
gsap.registerPlugin( CSSPlugin )

const ProfileSetup = (props) => {

  const location = useRef(null)
  const [questions, setQuestions] = useState([])

  const [data, setData] = useState({
    date_of_birth: '',
    sex: '',
    star_sign: '',
    longitude: '',
    latitude: ''
  })

  const [userQs, setUserQs] = useState({
    questions: []
  })

  useEffect(() => {
    axios.get('/api/questionchoices/')
      .then(res => setQuestions(res.data))
  }, [])

  function success(pos) {
    location.current.innerHTML = 'Successfully located!'
    var crd = pos.coords
    const position = { ...data, latitude: crd.latitude.toFixed(4), longitude: crd.longitude.toFixed(4) }
    setData(position)
  }

  const HandleLocate = (e) => {
    location.current.innerHTML = 'Locating...'
    navigator.geolocation.getCurrentPosition(success)
  }

  const HandleCheck = (e) => {
    Array.from(document.getElementsByClassName('gender-input')).map(el => {
      el.checked = false
    })
    e.target.checked = true
  }

  const HandleChange = (e) => {
    const { name, value } = e.target
    const body = { ...data, [name]: value }
    console.log(body)
    setData(body)
  }

  const Zodiac = (day, month) => {
    const zodiac = ['', 'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
      'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn']
    const lastDay = ['', 19, 18, 20, 20, 21, 21, 22, 22, 21, 22, 21, 20, 19]
    return (day > lastDay[month]) ? zodiac[month * 1 + 1] : zodiac[month]
  }

  const HandleSubmit = (e) => {
    e.preventDefault()
    // SPLITTING DATA FOR THE ZODIAC FUNCTION
    const date = data.date_of_birth.split('-')
    const day = parseInt(date[2].replace(/^0+/, ''))
    const month = parseInt(date[1].replace(/^0+/, ''))
    const sign = Zodiac(day, month)
    // NEW OBJ FOR THE PATCH REQUEST TO UPDATE DETAILS
    const body = { ...data, star_sign: sign }
    console.log(body)

    axios.patch(`/api/users/${auth.getUserId()}/`, body)
      .then(res => {
        // SETTING DATA FOR POST REQUEST TO USER QUESTIONS SELECTED
        const update = { questions: [], owner: auth.getUserId() }
        userQs.questions.map(el => {
          update.questions.push(el.id)
        })
        axios.post('/api/userquestions/', update)
          // ASSIGNING THE USERQUESTION TO THE ACTUAL USER IN THE PATCH REQUEST TO USER MODEL
          .then(res => axios.patch(`/api/users/${auth.getUserId()}/`, { questions: res.data.id }))
          .then(res => props.history.push(`/user/${auth.getUserId()}/questions`) )
      })
  }

  const HandleSelect = (e, el) => {
    let vCount = 0
    let pCount = 0
    const name = e.target.className
    const q = e.target.style
    Array.from(document.querySelectorAll('.v-qs')).map(element => {
      element.style.color === 'brown' ? vCount += 1 : null
    })
    Array.from(document.querySelectorAll('.p-qs')).map(element => {
      element.style.color === 'brown' ? pCount += 1 : null
    })
    // PUSHING SELECTED QUESTIONS INTO STATE FOR IT TO BE PASSED TO ANSWERING PHASE
    let add = userQs.questions.concat(el)

    if (q.color === 'brown') {
      q.color = 'black'
      q.fontWeight = 'normal'
      name === 'v-qs' ? vCount -= 1 : pCount -= 1
      add = add.filter(element => {
        return element !== el
      })
      setUserQs({ questions: add })
      return
    } else {
      if (name === 'v-qs' && vCount < 3) {
        q.color = 'brown'
        q.fontWeight = 'bold'
        vCount += 1
        setUserQs({ questions: add })
        console.log(add)
        return
      } else if (name === 'p-qs' && pCount < 3) {
        q.color = 'brown'
        q.fontWeight = 'bold'
        pCount += 1
        setUserQs({ questions: add })
        console.log(add)
        return
      }
      return
      
    }
  }


  const HandleExpand = (e) => {
    const list = Array.from(document.querySelectorAll('.ques'))
    const t1 = new TimelineLite
    console.log(e.target)
    if (e.target.id === 'pref') {
      list[0].style.height === '10%' ? (
        t1.to(list[0], 0.3, { height: '60%' })
          .to('.p-qs', 0.2, { display: 'block', opacity: 1 }, '+=0.4')
      ) : (
        t1.to('.p-qs', 0.1, { display: 'none', opacity: 0})
          .to(list[0], 0.25, { height: '10%' }, '+=0.2')
      )
    } else {
      list[1].style.height === '10%' ? (
        t1.to(list[1], 0.3, { height: '60%' })
          .to('.v-qs', 0.2, { display: 'block', opacity: 1 }, '+=0.4')
      ) : (
        t1.to('.v-qs', 0.1, { display: 'none', opacity: 0})
          .to(list[1], 0.25, { height: '10%' }, '+=0.2')
      )
    }


  }
  return (
    <>
      <div className="setup-container">
        <Header />
        
        <div className="setup-content">
       
          <form onSubmit={(e) => HandleSubmit(e)} onChange={(e) => HandleChange(e)}>
            <h1> User Settings <br/ > <small> Let's set you up for your date </small></h1>
            {/* location */}
            <div className='setup-date'>
              <h2> Your location is...  </h2>
              <h5 ref={location} onClick={(e) => HandleLocate(e)}> Find Me
                <ion-icon name="location-outline"></ion-icon></h5>
            </div>

            {/* date of birth */}
            <div className='setup-date'>
              <h2> Your date of birth is...  </h2>
              <input type="date" required='required' name="date_of_birth" max="2002-04-01" />
            </div>

            {/* Gender */}
            <div className='setup-gender'>
              <h2> You are a...  </h2>
              <div className="setup-checkbox">
                <label> Man
                  <input onClick={(e) => HandleCheck(e)} name='sex' value='man' className='gender-input' type="checkbox" />
                </label>
                <label>Woman
                  <input onClick={(e) => HandleCheck(e)} name='sex' value='woman' className='gender-input' type="checkbox" />
                </label>
              </div>
            </div>

            <button>Save and move on <ion-icon name="arrow-forward-outline"></ion-icon> </button>
          </form>




          <h3> User Questions <br /><small> Choose 3 questions from each category</small></h3>
          <div style={{height: '10%'}}className="ques">
            <h5 id='pref' onClick={(e) => HandleExpand(e)}> Questions based on preferences
              <span ><ion-icon id='pref' onClick={(e) => HandleExpand(e)} name="add-outline"></ion-icon></span></h5>
            {questions.map(ques => {
              if (ques.category === 'preference') {
                return (
                  <p className='p-qs' onClick={(e) => HandleSelect(e, ques)} key={ques.id}> {ques.choice} </p>
                )
              }
            })}
          </div>

          <div style={{height: '10%'}} className="ques">
            <h5 id='vals' onClick={(e) => HandleExpand(e)}> Questions based on values
              <span><ion-icon id='vals' onClick={(e) => HandleExpand(e)} name="add-outline"></ion-icon></span></h5>
            {questions.map(ques => {
              if (ques.category === 'values') {
                return (
                  <p className='v-qs' onClick={(e) => HandleSelect(e, ques)} key={ques.id}> {ques.choice} </p>
                )
              }
            })}
          </div>

        </div>
      </div>
    </>
  )
}

export default ProfileSetup