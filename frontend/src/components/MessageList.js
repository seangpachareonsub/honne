import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import auth from './lib/auth'
import axios from 'axios'
import Header from './Header'
import Navbar from './Navbar'



const Messages = () => {

  const [matches, setMatches] = useState([])
  const [convos, setConvos] = useState([])

  useEffect(() => {

    axios.get(`/api/users/${auth.getUserId()}`)
      .then(res => {
        setMatches(res.data.matches.reverse())
        // SORTING ORDER OF CONVOS BY MOST RECENT MESSAGE
        const sorted = res.data.conversations.sort((a, b) => {
          if (a.messages.length && b.messages.length) {
            if ((a.messages[a.messages.length - 1].id) >
              (b.messages[b.messages.length - 1].id)) {
              return -1
            } else {
              return 1
            }
          } else {
            return -1
          }
        })
        console.log(res.data.matches)
        setConvos(sorted)
      })
  }, [])

  return (
    <>
      <div className='messages-container'>
        <Header />
        <div className='new-matches'>
          <h4> Recent matches </h4>
          <div className='match-slider'>
            {matches.length !== 0 ? matches.map((el, i) => {
              if (i < 11) {
                return (
                  <Link key={el.id} to={`/user/${el.id}`}>
                    <div>
                      <img src={el.images.length === 0 ? 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png' :
                        el.images[0].picture.replace('8001', '8000')} />
                      <h6> {el.first_name} </h6>
                    </div>
                  </Link>

                )

              }
            }) : (<Link to='/swipe'>
              <div>
                <img src='https://img.ponparemall.net/imgmgr/37/00104837/kanji/tkanjiold_01/img10454081242.jpg?ver=1&size=pict300_300'/>
                <h6> Honne Team </h6>
              </div>
            </Link>)}
          </div>
        </div>

        <div className='message-list'>
          <h4> Messages </h4>
          <div className='buffer'> & </div>
          {convos.messages !== 0 ? convos.map(el => {
            return (
              <Link to={`/message/${el.id}`} key={el.id}>
                <div className='preview-row' >
                  <img src={el.user_one.id === auth.getUserId() ? el.user_two.images.length === 0 ? 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png' :
                    el.user_two.images[0].picture.replace('8001', '8000') : el.user_one.images.length === 0 ? 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png' :
                    el.user_one.images[0].picture.replace('8001', '8000')} />
                  <div className='preview-text'>
                    <h5> {el.user_one.id === auth.getUserId() ? el.user_two.first_name : el.user_one.first_name} </h5>
                    <p> {el.messages.length ? el.messages[el.messages.length - 1].string : 'It all starts with a "Hello!"'} </p>
                  </div>
                </div>
              </Link>
            )
          }) : (<Link to='/swipe'>
            <div className='preview-row' >
              <img src={'https://img.ponparemall.net/imgmgr/37/00104837/kanji/tkanjiold_01/img10454081242.jpg?ver=1&size=pict300_300'} />
              <div className='preview-text'>
                <h5> Honne Team </h5>
                <p> You don't have any convos yet, get answering! </p>
              </div>
            </div>
          </Link>)}
        </div>
        <Navbar />
      </div>
    </>
  )
}

export default Messages
