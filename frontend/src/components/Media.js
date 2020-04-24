import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import auth from './lib/auth'
import Header from './Header'

const Media = (props) => {

  const [user, setUser] = useState([])
  const [emptySlots, setEmptySlots] = useState([])
  const input = useRef()

  const updateUser = () => {
    axios.get(`/api/users/${auth.getUserId()}`)
      .then(res => {
        setUser(res.data)
        const slotNumbers = []
        for (let i = 0; i < 6 - res.data.images.length; i++) {
          slotNumbers.push(1)
        }
        setEmptySlots(slotNumbers)
      })
  }

  useEffect(() => updateUser(), [])

  const HandleChange = (e) => {
    const image = e.target.files
    const picture = new FormData()
    picture.append('owner', auth.getUserId())
    picture.append('picture', image[0], image[0].name)

    axios.post('/api/individualpictures/', picture)
      .then(res => {
        const images = []
        user.images.map(el => images.push(el.id))
        images.push(res.data.id)
        axios.patch(`/api/users/${user.id}/`, { images: images })
          .then(res => {
            updateUser()
          })
      })
  }

  const HandleDelete = (e) => {
    axios.delete(`/api/individualpictures/${e.target.id}/`)
      .then(res => updateUser())
  }

  const HandleFile = (e) => {
    input.current = e.target.previousSibling
    input.current.click()
  }

  const Redirect = () => {
    props.history.push(`/user/${auth.getUserId()}`)
  }

  return (
    <div className='media-container'>
      <button onClick={Redirect}> Save </button>
      <Header />

      {user.images ? user.images.map(el => {
        return (
          <div key={el.id} className="image-container">
            <ion-icon id={el.id} onClick={(e) => HandleDelete(e)} name="close-circle"></ion-icon>
            <img src={el.picture.replace('8001', '8000')} alt="" />
          </div>
        )
      }) : null}

      {emptySlots.map((el, i) => {
        return (
          <div key={i} className="input-container">
            <input style={{ display: 'none' }} onChange={(e) => HandleChange(e)} type="file" />
            <ion-icon onClick={(e) => HandleFile(e)} name="add-circle"></ion-icon>
          </div>
        )
      })}
    </div>
  )
}

export default Media