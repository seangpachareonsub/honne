
import React, { Link } from 'react'
import axios from 'axios'
import auth from './lib/auth'

const DeleteAccount = ({ props, setModalOpen }) => {

  const HandleButtons = (e) => {
    e.target.id === 'delete' ? (
      axios.delete(`/api/users/${auth.getUserId()}/`)
        .then(res => props.history.push('/'))
    ) : setModalOpen(false)
  }

  return (

    <div className='modal is-active'>
      <div className='modal-background'></div>

      <div className="modal-content">

        <div className="delete-container">
          <h1> Don't cheat on us please  </h1>
          <p> But if you're leaving us for someone else ... I'll understand</p>

          <div className="delete-button">
            <button id='delete' onClick={HandleButtons}> Delete my account </button>
            <button id='return' onClick={HandleButtons}> Go back </button>
          </div>
        </div>



      </div>



    </div>
  )
}

export default DeleteAccount