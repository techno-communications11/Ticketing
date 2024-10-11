import React from 'react'

function ReusableButtons({bigText,smallText,setActiveForm,activeForm}) {
  return (
    <div className="d-flex justify-content-center gap-2 my-3">
    <button
      className={`btn ${activeForm === 'register' ? 'btn-success' : 'btn-danger'}`}
      onClick={() => setActiveForm('register')}
    >
      {bigText}
    </button>
    <button
      className={`btn ${activeForm === 'upload' ? 'btn-success' : 'btn-danger'}`}
      onClick={() => setActiveForm('upload')}
    >
      {smallText}
    </button>
  </div>
  )
}

export default ReusableButtons
