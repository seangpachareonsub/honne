import React, { useEffect, useState } from 'react'
import axios from 'axios'
import auth from './lib/auth'
import moment from 'moment'
import { Link } from 'react-router-dom'

const Chat = (props) => {

  const [data, setData] = useState([])
  const [message, setMessage] = useState({
    string: '',
    sent_from: '',
    sent_to: ''
  })
  const [otherUser, setOther] = useState({
    images: [{
      picture: ''
    }]
  })

  const scroll = () => {
    const div = document.querySelector('.convo-container')
    div.scrollTop = div.scrollHeight
  }

  useEffect(() => {
    axios.get(`/api/messages/${props.match.params.id}`)
      .then(res => {
        setData(res.data)
        console.log(res.data)
        if (res.data.user_one.id === auth.getUserId()) {
          setMessage({ sent_from: res.data.user_one.id, sent_to: res.data.user_two.id })
          axios.get(`/api/users/${res.data.user_two.id}/`)
            .then(res => setOther(res.data))
        } else {
          setMessage({ sent_from: res.data.user_two.id, sent_to: res.data.user_one.id })
          axios.get(`/api/users/${res.data.user_one.id}/`)
            .then(res => setOther(res.data))
        }
        scroll()
      })
  }, [])


  const HandleChange = (e) => {
    setMessage({ ...message, string: e.target.value })
  }

  const HandleSubmit = (e) => {
    e.preventDefault()
    axios.post('/api/individualmessages/', message)
      .then(response => {
        // CREATING NEW ARRAY TO UPDATE LIST OF MESSAGES IN THE CONVO
        const update = []
        // PUSHING THE CURRENT ID'S FROM THE ORIGINAL CONVO AND THE NEW ONE JUST POSTED
        data.messages.map(el => update.push(el.id))
        update.push(response.data.id)
        // CREATING OUR REQ OBJECT TO SEND OFF TO UPDATE CONVO
        const convo = { messages: update }
        // PUT REQUEST TO UPDATE CONVO 
        // AND GET REQUEST TO UPDATE STATE AND RE RENDER CONVO
        axios.patch(`/api/messages/${data.id}/`, convo)
          .then(res => axios.get(`/api/messages/${data.id}`))
          .then(res => {
            setData(res.data)
            scroll()
          })
      })
    e.target.firstChild.value = ''
  }



  return (
    <>
      <div className='chat-container'>
        <div className='header'>
          <Link to='/messages'> <ion-icon name="arrow-back-outline"></ion-icon></Link>
          <Link className='other-image' to={`/user/${otherUser.id}`}> <img src={otherUser.images.length === 0 ? 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png' 
            : otherUser.images[0].picture.replace('8001', '8000')} /> </Link>
          <h3> {otherUser.first_name} </h3> 
        </div>
        <div className="convo-container">
          <div className="position-container">
            {data.messages ? data.messages.map((el, i) => {
              return (
                <div key={i}
                  className={el.sent_from === auth.getUserId() ? 'user-box' : 'other-box'}>
                  <p> {el.string} </p>
                  <small> {moment(el.created_at).format('HH:mm')} </small>
                </div>
              )
            }) : null}
          </div>

        </div>

        <form onSubmit={(e) => HandleSubmit(e)} onChange={(e) => HandleChange(e)}>
          <textarea type='text' />
          <button> <ion-icon name="paper-plane-outline"></ion-icon> </button>
        </form>
      </div>
    </>
  )
}

export default Chat

