import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import Header from './Header'
import Navbar from './Navbar'
import auth from './lib/auth'
import ReactMapGL, { Marker, Popup } from 'react-map-gl'

const Explore = (props) => {

  const key = 'pk.eyJ1Ijoic2VhbmdwYWNoYXJlb25zdWIiLCJhIjoiY2s5OGE2NGduMDBveTNubW43ang4NnFoayJ9.6qxOtlGy2vVtypOyGd7-DA'

  const [viewport, setViewport] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 13,
    width: 375,
    height: 525
  })

  const [markers, setMarkers] = useState([])
  const [user, setUser] = useState()
  const [allUsers, setAllUsers] = useState([])
  const [selected, setSelected] = useState()
  const location = useRef(null)

  const sliderLoop = () => {
    const progress = document.querySelector('.progress-bar')
    const slider = document.querySelector('.slider')
    const rangeValue = document.querySelector('.range-value')
    rangeValue.innerHTML = slider.value + 'km'
    progress.style.width = slider.value / 1.15 + '%'
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

  const HandleRadius = (e) => {
    sliderLoop()
    const value = document.querySelector('.range-value').innerHTML.replace('km', '')
    const arr = []
    allUsers.map(el => {
      const dis = getDistance(user.latitude, user.longitude, el.latitude, el.longitude)
      parseInt(dis) <= parseInt(value) ? arr.push(el) : null
    })
    setMarkers(arr)
  }

  useEffect(() => {
    sliderLoop()
    axios.get('/api/users/')
      .then(res => {
        res.data.map(el => {
          if (el.id === auth.getUserId()) {
            setUser(el)
            console.log(el.latitude, el.longitude)
            setViewport({ ...viewport, latitude: parseFloat(el.latitude), longitude: parseFloat(el.longitude) })
          }
        })
        setMarkers(res.data)
        setAllUsers(res.data)
      })
  }, [])

  function success(pos) {
    location.current.innerHTML = 'Successfully located!'
    var crd = pos.coords
    const position = { latitude: crd.latitude.toFixed(4), longitude: crd.longitude.toFixed(4) }
    axios.patch(`/api/users/${auth.getUserId()}/`, position)
      .then(res => {
        setUser(res.data)
        setViewport({ ...viewport, latitude: parseFloat(res.data.latitude), longitude: parseFloat(res.data.longitude) })
      })
  }

  const HandleLocate = (e) => {
    location.current.innerHTML = 'Locating...'
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(success)
    }, 1500)
  }

  return (
    <div className='explore-container'>
      <Header />
      <Navbar />
      <div className='inputs'>
        {/* LOCATION */}
        <h5 ref={location} onClick={(e) => HandleLocate(e)}> Find Me!
          <ion-icon name='location-outline'></ion-icon></h5>

        {/* RADIUS */}
        <div className='input-container'>
          <div className='input-text'>
            <h2> Radius </h2>
            <h2 className='range-value'> </h2>
          </div>
          <div className='slider-container'>
            <input onChange={(e) => HandleRadius(e)} name='distance' className='slider' type='range' min='0' max='100' />
            <div className='progress-bar'></div>
          </div>
        </div>
      </div>

      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={key}
        mapStyle='mapbox://styles/seangpachareonsub/ck98akro50l831iluwfd45321/draft'
        onViewportChange={viewport => {
          setViewport(viewport)
        }}>

        {markers.map(el => {
          if (el.id !== auth.getUserId() && el.latitude) {
            return (
              <Marker key={el.id}
                longitude={parseFloat(el.longitude)}
                latitude={parseFloat(el.latitude)}
                anchor={'top-left'}
                offsetLeft={-20}
                offsetTop={-30}>
                <div className='other-marker'>
                  <ion-icon onClick={() => { setSelected(el) }} name='pin-outline'></ion-icon>
                </div>
              </Marker>
            )
          } else if (el.latitude) {
            return (
              <Marker key={user.id} 
                anchor={'top-left'}
                offsetLeft={-20}
                offsetTop={-30}
                latitude={parseFloat(el.latitude)}
                longitude={parseFloat(el.longitude)} >
                <div className='user-marker'>
                  <ion-icon name="pin-outline"></ion-icon>
                </div>
              </Marker>
            )
          }
        })}


        {selected ? (
          <Popup
            offsetLeft={-5}
            offsetTop={-32}
            latitude={parseFloat(selected.latitude)}
            longitude={parseFloat(selected.longitude)}
            onClose={() => { setSelected(null) }}>
            <h1> {selected.first_name}</h1>
            <p> {`${getDistance(parseFloat(user.latitude),
              parseFloat(user.longitude), parseFloat(selected.latitude),
              parseFloat(selected.longitude))} km away`} </p>
          </Popup>

        ) : null}
      </ReactMapGL>
    </div>
  )
}

export default Explore