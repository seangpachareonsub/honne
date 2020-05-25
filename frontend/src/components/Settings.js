import React, { useState, useEffect } from 'react'
import auth from './lib/auth'
import axios from 'axios'
import Header from './Header'
import DeleteAccount from './DeleteAccount'


const Settings = (props) => {

  const [data, setData] = useState({
    sex: '',
    min_age: '',
    max_age: '',
    distance: '',
    owner: auth.getUserId()
  })

  const [id, setId] = useState()
  const [modalOpen, setModalOpen] = useState(false)

  const sliderLoop = () => {
    const progress = Array.from(document.getElementsByClassName('progress-bar'))
    const slider = Array.from(document.getElementsByClassName('slider'))
    const rangeValue = Array.from(document.getElementsByClassName('range-value'))
    for (let i = 0; i < 3; i++) {
      rangeValue[i].innerHTML = slider[i].value
      progress[i].style.width = slider[i].value - 13 + '%'
      if (i === 0) {
        rangeValue[i].innerHTML = slider[i].value + 'km'
        progress[i].style.width = slider[i].value - 10 + '%'
      }
    }
  }

  useEffect(() => {
    const slider = Array.from(document.getElementsByClassName('slider'))
    const checkbox = Array.from(document.getElementsByClassName('gender-input'))
    axios.get(`/api/users/${auth.getUserId()}`)
      .then(res => {
        // creating array of values to set initial values of the settings
        const preferences = Object.values(res.data.preferences)
        // get rid of 1 and 5 elements (id and owner)
        preferences.shift()
        // store the id to use in a patch request when editing settings
        setId(res.data.preferences.id)
        // assign values according to the object.values
        for (let i = 0; i < 3; i++) {
          slider[i].value = preferences[i]
          if (checkbox[i].value === preferences[3]) {
            checkbox[i].checked = true
          }
        }
        sliderLoop()
        return
      })
    if (!id) {
      slider.map(el => el.value = el.min)
      sliderLoop()
    }
  }, [])

  const HandleChange = (e) => {
    sliderLoop()
    const { name, value } = e.target
    const body = { ...data, [name]: value }
    setData(body)
  }

  const HandleSubmit = (e) => {
    e.preventDefault()
    // post request to userpreferences
    if (!id) {
      axios.post('/api/userpreferences/', data)
        // put request to assign preference to specific user
        .then(res => {
          axios.patch(`/api/users/${auth.getUserId()}/`, {
            preferences: res.data.id
          })
        })
    } else {
      const edit = { ...data }
      for (var propName in edit) {
        if (edit[propName] === '') {
          delete edit[propName]
        }
      }
      axios.patch(`/api/userpreferences/${id}/`, edit)
    }
    props.history.goBack()
  }

  const HandleCheck = (e) => {
    Array.from(document.getElementsByClassName('gender-input')).map(el => {
      el.checked = false
    })
    e.target.checked = true
  }

  return (
    <>
      <Header />
      <div className='settings-container'>
        <h1> Discovery </h1>
        <form onChange={(e) => HandleChange(e)} onSubmit={(e) => HandleSubmit(e)}>

          {/* Distance */}
          <div className='input-container'>
            <div className='input-text'>
              <h2> Distance </h2>
              <h2 className='range-value'> </h2>
            </div>
            <div className='slider-container'>
              <input name='distance' className='slider' type="range" min='10' max='100' />
              <div className='progress-bar'></div>
            </div>
          </div>

          {/* Min Age */}
          <div className='input-container'>
            <div className='input-text'>
              <h2> Min. Age </h2>
              <h2 className='range-value'> </h2>
            </div>
            <div className='slider-container'>
              <input name='min_age' className='slider' type="range" min='18' max='100' />
              <div className='progress-bar'></div>
            </div>
          </div>

          {/* Max Age */}
          <div className='input-container'>
            <div className='input-text'>
              <h2> Max. Age </h2>
              <h2 className='range-value'> </h2>
            </div>
            <div className='slider-container'>
              <input name='max_age' className='slider' type="range" min='18' max='100' />
              <div className='progress-bar'></div>
            </div>
          </div>

          {/* Gender */}
          <div className='gender-container'>
            <div className='input-text'>
              <h2> Sex </h2>

              <div className="checkbox-container">
                <label> Man
                  <input onClick={(e) => HandleCheck(e)} name='sex' value='man' className='gender-input' type="checkbox" />
                </label>

                <label>Woman
                  <input onClick={(e) => HandleCheck(e)} name='sex' value='woman' className='gender-input' type="checkbox" />
                </label>

                <label> Both
                  <input onClick={(e) => HandleCheck(e)} name='sex' value='both' className='gender-input' type="checkbox" />
                </label>
              </div>
            </div>
          </div>
          <button> Save </button>
        </form>



        {modalOpen ? <DeleteAccount props={props} setModalOpen={setModalOpen} /> : null}

        <div className='terms'>
          <h1> Legal </h1>
          <h2>Terms & Conditions</h2>
          <h2>Privacy Policy</h2>
          <h2>Licenses</h2>
          <div onClick={() => { setModalOpen(!modalOpen) }} className="delete-account">
            <h3> Delete my account </h3>
          </div>
          <h2> 本音 </h2>
        </div>
      </div>
    </>
  )
}

export default Settings