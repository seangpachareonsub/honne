import React, { useState, useEffect } from 'react'
import axios from 'axios'
import auth from './lib/auth'

const Login = ({ history }) => {
  const [body, setBody] = useState({
    email: '',
    password: ''
  })



  useEffect(() => {
    history.email ? setBody({ email: history.email, password: history.password }) : null
  }, [])

  const HandleChange = () => {
    const { name, value } = event.target
    const data = { ...body, [name]: value }
    setBody({ ...body, ...data })
  }

  const [error, setError] = useState()

  const HandleSubmit = (e) => {
    e.preventDefault()
    axios.post('/api/login', body)
      .then(res => {
        auth.setToken(res.data.token)
        history.email = ''
        history.password = ''
        axios.get(`/api/users/${auth.getUserId()}/`)
          .then(res => {
            !res.data.sex ?
              history.push('/user/setup') : history.push(`/user/${auth.getUserId()}`)
          })
      })
      .catch(err => setError(err.response.data))

      .catch(err => console.log(err))
    Array.from(e.target.childNodes).map(el => {
      el.value = ''
    })
  }

  return (
    <>
      <div className='login-container'>
      <video autoPlay loop src='https://i.imgur.com/sKvcjpH.mp4'></video>
        <h1> HONNE <br /> <span> 本音 </span></h1>
        <form onChange={(e) => HandleChange(e)} onSubmit={(e) => HandleSubmit(e)}>
          <input name='email' autoComplete='off' value={history.email} placeholder='Email Address' type="text" />
          <input name='password' autoComplete='off' value={history.password} placeholder='Password' type="password" />
          {error ? <small> {error.message} </small> : null}
          <button> Login </button>
        </form>

      </div>
    </>
  )
}

export default Login