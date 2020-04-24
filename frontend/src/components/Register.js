import React, { useState } from 'react'
import axios from 'axios'
import Header from './Header'

const Register = (props) => {

  const [body, setBody] = useState({
    first_name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })

  const [error, setError] = useState()

  const HandleChange = (e) => {
    const { name, value } = event.target
    const data = { ...body, [name]: value }
    setBody({ ...body, ...data })
  }

  const HandleSubmit = (e) => {
    e.preventDefault()
    console.log(body)
    axios.post('/api/register', body)
      .then(res => {
        props.history.email = body.email
        props.history.password = body.password
        props.history.push('/login')
      })
      .catch(err => {
        console.log(err.response.data)
        setError(err.response.data)
      })

    Array.from(e.target.childNodes).map(el => {
      el.value = ''
    })
  }

  return (
    <>
      <div className='register-container'>
        <video autoPlay loop src='https://i.imgur.com/sKvcjpH.mp4'></video>
        {/* <Header /> */}
        <h1> HONNE <br /> <span> 本音 </span></h1>
        <form onChange={(e) => HandleChange(e)} onSubmit={(e) => HandleSubmit(e)}>
          <input autoComplete='off' name='first_name' placeholder='First Name' type="text" />
          {error ? error.first_name ? <small id='first'> {error.first_name[0]} </small> : null : null}
          <input autoComplete='off' name='email' placeholder='Email Address' type="text" />
          {error ? error.email ? <small id='second'> {error.email[0]} </small> : null : null}
          <input autoComplete='off' name='password' placeholder='Password' type="password" />
          {error ? error.password ? <small id='third'> {error.password[0]} </small> : null : null}
          <input autoComplete='off' name='password_confirmation' placeholder='Password Confirmation' type="password" />
          {error ? error.password_confirmation ? <small id='fourth'> {error.password_confirmation[0]} </small> : null : null}
          <button> Register </button>
        </form>
      </div>

    </>
  )
}

export default Register