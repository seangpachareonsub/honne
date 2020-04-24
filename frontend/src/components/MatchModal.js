
import React, { Link } from 'react'

const MatchModal = ({ ToggleModal, CurrentCard, props, refreshState, User }) => {

  const upper = CurrentCard.first_name.replace(/^\w/, c => c.toUpperCase())
  console.log(CurrentCard, User)

  const HandleButtons = (e) => {
    e.target.id === 'swipe' ? props.history.push('/swipe') : props.history.push('/messages')
    ToggleModal()
    refreshState()
  }

  return (

    <div className='modal is-active'>
      <div className='modal-background'></div>

      <div className="modal-content">

        <h1>{`Congrats, you matched with ${upper}!`} <ion-icon name="heart"></ion-icon></h1>

        <div>
          <img src={User.images.length === 0 ? 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png' :
            User.images[0].picture.replace('8001', '8000')} />
          <img src={CurrentCard.images.length === 0 ? 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png'
            : CurrentCard.images[0].picture.replace('8001', '8000')} />
        </div>

        <h3> Say whaaaa!? They're already on your messages list! </h3>

        <div>
          <button id='swipe' onClick={(e) => HandleButtons(e)}> Keep Playing  </button>
          <button id='message' onClick={(e) => HandleButtons(e)}> {`Message ${upper}`}  </button>
        </div>

      </div>



    </div>
  )
}

export default MatchModal

// onClick={ToggleModal}