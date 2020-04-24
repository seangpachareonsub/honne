import React, { useState, useEffect } from 'react'
import auth from './lib/auth'
import axios from 'axios'
import Header from './Header'

const AnswerQuestions = (props) => {
  const [ques, setQues] = useState({
    questions: []
  })
  const [answers, setAnswers] = useState({
    answers: ''
  })

  const [questionId, setQuestionId] = useState()

  useEffect(() => {
    axios.get(`/api/users/${auth.getUserId()}/`)
      .then(res => {
        setQuestionId(res.data.questions.id) 
        setQues({ questions: res.data.questions.questions })
      })
  }, [])

  const HandleSelect = (e) => {
    const arr = []
    const { style } = e.target
    const option = Array.from(document.querySelectorAll('.select-answer'))
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
    setAnswers({ answers: arr.join() })
  }

  const HandleSave = (e) => {
    axios.patch(`/api/userquestions/${questionId}/`, answers) 
      .then(res => props.history.push(`/user/${auth.getUserId()}`))
  }
 
  return (
    <div className='question-container'>
      <Header />
      <h2> 本音 are a person's true feelings. </h2>
      <div className="question-answer">
        {ques.questions.map((el, i) => {
          return (
            <div key={el.id} className="qa-row">
              <small> {i + 1}. Question type: {el.category} </small>
              <h4> {el.choice} </h4>
              <div className="answers">
                <p className='select-answer' onClick={(e) => HandleSelect(e)} id={i}> {el.options.split(',')[0]} </p>
                <p className='select-answer' onClick={(e) => HandleSelect(e)} id={i}> {el.options.split(',')[1]} </p>
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={(e) => HandleSave(e)}> SAVE </button>
     
    </div>
  )
}

export default AnswerQuestions