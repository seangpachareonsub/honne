import React, { useEffect, useState, useRef } from 'react'
// import { withRouter } from 'react-router-dom'
import Navbar from './Navbar'
import Header from './Header'
import axios from 'axios'
import auth from './lib/auth'
import moment from 'moment'
import { TimelineLite, gsap, CSSPlugin } from 'gsap'
gsap.registerPlugin( CSSPlugin )
import MatchModal from './MatchModal'

const Swipe = (props) => {

  const [potentials, setPotentials] = useState([])
  const [user, setUser] = useState()
  const [cardIds, setCardIds] = useState([])
  const [count, setCount] = useState(1)
  const [questionCount, setQuestionCount] = useState(1)
  const [modalOpen, setModal] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const container = useRef(null)
  const buttons = useRef(null)
  const questionSlide = useRef(null)



  const ToggleModal = () => {
    setModal(!modalOpen)
  }

  const refreshState = () => {
    const t1 = new TimelineLite
    const width = container.current.clientWidth
    axios.get(`/api/users/${auth.getUserId()}/`)
      .then(res => {
        setUser(res.data)
        t1
          .to('.question-slideshow', 0.1, { transform: 'translateY(0px)', transition: 'none' })
          .to(container.current, 0.1, { transform: `translateX(-${width * count}px)` }, '+=0.31')
          .to(buttons.current, 0.1, { width: '20%' }, '-=0.3')
          .to('#hide', 0.1, { display: 'block' })

        buttons.current.innerHTML = 'Match Me <ion-icon name="heart"></ion-icon>'
        setCount(count + 1)
        setQuestionCount(1)
      })
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)  // deg2rad below
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d.toFixed()
  }

  useEffect(() => {
    axios.get('/api/users')
      .then(res => {
        let user = null
        res.data.map(el => {
          if (el.id === auth.getUserId()) {
            user = el
            setUser(el)
          }
        })
        const filter = res.data.filter(el => {
          const uSex = user.preferences.sex
          const min = user.preferences.min_age
          const max = user.preferences.max_age
          const age = moment().diff(el.date_of_birth, 'years')
          const dis = getDistance(user.latitude, user.longitude, el.latitude, el.longitude)
          const rejected = user.rejected.map(el => el.id)
          const matched = user.matches.map(el => el.id)
          // RETURNING A FILTERED ARRAY BASED ON CURRENT USER
          // PREFERENCES = DISTANCE, SEX AND AGE
          // AND DO NOT RETURN ALREADY MATCHED AND REJECTED USERS AND IS NOT THEMSELF
          if (uSex === 'both') {
            return age >= min && age <= max &&
              dis <= user.preferences.distance &&
              !rejected.includes(el.id) &&
              !matched.includes(el.id) &&
              el.id !== user.id ? el : null
          } else {
            return el.sex === uSex &&
              age >= min && age <= max &&
              dis <= user.preferences.distance &&
              !rejected.includes(el.id) &&
              !matched.includes(el.id) &&
              el.id !== user.id ? el : null
          }
        })
        setPotentials(filter)

        // PUSH QUESTION IDS IN ORDER TO GRAB THEM LATER TO COMPARE ANSWERS
        const arr = []
        filter.map(el => el.questions ? arr.push(el.questions.id) : arr.push(0))
        setCardIds(arr)
        console.log(arr) // #1
        console.log(filter)// #2
      })
  }, [])

  const HandleSwipe = (e) => {
    const width = container.current.clientWidth
    const t1 = new TimelineLite

    if (count > potentials.length - 1) {
      return
    } else {
      //  MOVING THE SLIDESHOW ANIMATION
      t1.to(container.current, 0.15, { filter: 'blur(6px)', opacity: 0 })
        .to(container.current, 0.1, { transform: `translateX(-${width * count}px)` }, '+=0.3')
        .to(container.current, 0.1, { filter: 'blur(0)', opacity: 1 }, '+=0.30')
        .to('.question-slideshow', 0.1, { transform: 'translateY(0px)', transition: 'none' })
      // PUSH REJECTED PERSON INTO THE CURRENT USERS REJECTED ARR
      const current = user.rejected.map(el => el.id)
      const updateRejects = current.concat(potentials[count - 1].id)
      axios.patch(`/api/users/${auth.getUserId()}/`, { rejected: updateRejects })
        .then(res => {
          axios.get(`/api/users/${auth.getUserId()}/`)
            .then(res => {
              setUser(res.data)
              // ADD 1 TO THE COUNT
              setCount(count + 1)
              // WE POP OFF THE LAST ELEMENT IN ORDER TO UPDATE THE QUESTION SET WE'RE ON ACCORDING TO THE COUNT
              const newArr = [...cardIds]
              newArr.shift()
              setCardIds(newArr)
              setQuestionCount(1)
            })
        })
    }
  }

  const moveQuestion = () => {
    const height = questionSlide.current.clientHeight
    const t1 = new TimelineLite
    t1.to('.question-slideshow', 0.25, { transform: `translateY(-${height * questionCount}px)` })
    setQuestionCount(questionCount + 1)
  }

  const newArr = []
  const HandleSelect = (e) => {
    const arr = []
    const { style } = e.target
    const option = Array.from(document.querySelectorAll(`.select-${e.target.className.split('-')[1]}`))
    const pair = Array.from(e.target.parentNode.childNodes)
    // MAKES SURE ONLY ONE FROM THE OPTIONS IS SELECTED AT ONE
    pair.map(el => {
      el.style.color = 'black'
      el.style.fontWeight = 'normal'
    })
    style.color = 'brown'
    style.fontWeight = 'bold'
    // POPS INTO THE ARR ARRAY TO CREATE THE ARRAY OF ANSWERS FROM THE QUESTION LIST
    // WITH STRICT INDEX POSITIONING RELATIVE TO THE ORDER THE QUESTION IS SHOWN
    option.map(el => el.style.color === 'brown' ? arr[el.id] = el.innerHTML : null)
    setUserAnswers(arr.join())
    newArr.push(arr.join())
    console.log(arr)
    if ((e.target.id === '0' && arr[1] !== undefined) || (e.target.id === '1' && arr[0] !== undefined)) {
      moveQuestion()
    } else if ((e.target.id === '3' && arr[2] !== undefined) || (e.target.id === '2' && arr[3] !== undefined)) {
      moveQuestion()
    }
  }

  const HandleMatch = (e) => {
    const arr = cardIds.length === undefined ? [cardIds] : [...cardIds]
    let cardAns = []
    const t1 = new TimelineLite
    const userAns = userAnswers.replace(/ /g, '').split(',')
    let correctAnswers = 0


    // CHANGING THE BUTTON DISPLAY TO GIVE UI EFFECTS
    t1.to('#hide', 0.1, { display: 'none' })
      .to(buttons.current, 0.1, { width: '100%' })
    setTimeout(() => {
      buttons.current.innerHTML = 'Calculating results...'
    }, 0.3)

    // ACTUAL MATCHING CODE
    if (userAnswers.split(',').length !== 6) {
      return
    } else {
      setTimeout(() => {
        // GRABS THE ANSWERS FOR THE CURRENT SET OF QUESTIONS
        axios.get(`/api/userquestions/${arr.shift()}/`)
          .then(res => {
            cardAns = res.data.answers.split(',')
            cardAns.map((el, i) => {
              // COMPARES THE USER ANSWERS AND CURRENT CARD ANSWERS
              el.replace(/ /g, '') === userAns[i] ? correctAnswers += 1 : null
              console.log(el.replace(/ /g, ''), userAns[i])
            })
            console.log(correctAnswers)

            // IF MORE 4+ ANSWERS MATCH 
            if (correctAnswers >= 7) {

              // BRING OUT MODAL
              ToggleModal()

              const current = user.matches.map(el => el.id)
              const updateMatch = current.concat(res.data.owner)
              // PLACE PERSON IN MATCH FOLDER OF USER AND CREATE CONVERSATION
              console.log(updateMatch)
              // SEND PATCH REQUEST TO UPDATE ARRAY OF MATCHES
              axios.patch(`/api/users/${auth.getUserId()}/`, { matches: updateMatch })
                .then(res => {
                  const newConvo = {
                    user_one: res.data.id,
                    user_two: updateMatch.pop(),
                    messages: []
                  }
                  console.log(res.data)
                  console.log(newConvo)
                  // CREATING A NEW CONVO BETWEEN THE TWO USERS
                  axios.post('/api/messages/', newConvo)
                    .then(res => {
                      const arr = []
                      const newConvoId = res.data.id
                      arr.push(res.data.user_one)
                      arr.push(res.data.user_two)
                      // MAP THROUGH USERS OF THE NEW CONVO TO ASSIGN THE ACTUAL CONVO TO THEIR MODEL
                      arr.map(el => {
                        axios.get(`/api/users/${el}/`)
                          .then(res => {
                            const currentConvos = res.data.conversations.map(el => el.id)
                            const updateConvos = currentConvos.concat(newConvoId)

                            console.log(updateConvos)
                            axios.patch(`/api/users/${el}/`, { conversations: updateConvos })
                              .then(res => console.log(res.data))
                          })
                      })
                    })
                })

              // NOT A MATCH
            } else {
              const t1 = new TimelineLite
              const width = container.current.clientWidth
              buttons.current.innerHTML = 'Ahhhh it\'s not a match we\'re afraid!'
              setQuestionCount(1)
              setTimeout(() => {
                t1.to((container.current, buttons.current), 0.15, { filter: 'blur(6px)', opacity: 0 })
                  .to('.question-slideshow', 0.1, { transform: 'translateY(0px)', transition: 'none' })
                  .to(container.current, 0.1, { transform: `translateX(-${width * count}px)` }, '+=0.31')
                  .to(buttons.current, 0.1, { width: '20%' }, '-=0.3')
                  .to((container.current, buttons.current), 0.1, { filter: 'blur(0)', opacity: 1 }, '+=0.30')
                  .to('#hide', 0.1, { display: 'block' })

                setCount(count + 1)
                const newArr = [...cardIds]
                newArr.shift()
                setCardIds(newArr)
                buttons.current.innerHTML = ' Match Me <ion-icon name="heart"></ion-icon> '
              }, 1000)
            }
          })
      }, 2500)
    }
  }




  return (
    <div className='swipe-container'>
      <Header />
      <Navbar />
      <div className="user-swipe">
        {/* WHERE ALL THE MATCHES SHOW UP */}
        <div ref={container} className="slide-container">
          {potentials.map(el => {
            const dis = getDistance(user.latitude, user.longitude, el.latitude, el.longitude)

            const ques = el.questions ? el.questions : null



            return (
              <div key={el.id} id={el.questions ? el.questions.id : null} className="slides">
                {/* USER INFO SECTION */}
                <div className="slide-info">
                  <img src={el.images.length === 0 ? 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png' :
                    el.images[0].picture.replace('8001', '8000')} />
                  <div className="text">
                    <h2> {el.first_name} </h2>
                    <h5> {el.sex === 'woman' ? <ion-icon name="female-outline"></ion-icon> :
                      <ion-icon name="male-outline"></ion-icon>}
                      {moment().diff(el.date_of_birth, 'years')}
                      <span> {el.star_sign}  </span> <ion-icon name="location-outline"></ion-icon> {dis}km away </h5>
                  </div>

                </div>

                {/* QUESTIONS SECTION */}
                <div className="slide-questions">
                  <div ref={questionSlide} className="question-slideshow">
                    {ques ? ques.questions.sort((a,b) => a.id - b.id).map((el, i) => {
                      return (
                        <div className='rows' key={el.id}>
                          <h4> {i + 1}. Question type: {el.category} </h4>
                          <p> {el.choice} </p>
                          <div className="answers">
                            <p className={`select-${ques.id}`} id={i} onClick={(e) => HandleSelect(e)} > {el.options.split(',')[0]} </p>
                            <p className={`select-${ques.id}`} id={i} onClick={(e) => HandleSelect(e)} > {el.options.split(',')[1]} </p>
                          </div>
                        </div>
                      )
                    }) : null}
                  </div>
                </div>
              </div>
            )
          })}

        </div>

        <div className="button">

          <button ref={buttons} className='hearts' onClick={(e) => HandleMatch(e)}> Match Me <ion-icon name="heart"></ion-icon> </button>
          <button id='hide' className='hearts' onClick={(e) => HandleSwipe(e)}> Pass <ion-icon name="heart-dislike"></ion-icon></button>
        </div>
      </div>
      {
        modalOpen ? <MatchModal props={props}
          CurrentCard={potentials[count - 1]}
          ToggleModal={ToggleModal}
          refreshState={refreshState}
          User={user} /> : null
      }
    </div >
  )
}

export default Swipe