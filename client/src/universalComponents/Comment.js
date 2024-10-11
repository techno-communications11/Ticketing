import React from 'react'
import { TbSend2 } from "react-icons/tb";
import { Button } from 'react-bootstrap';

function Comment({handleCommentChange,handleSubmit,comment}) {
  return (
   
      <form onSubmit={handleSubmit} className="w-100 d-flex align-items-center border rounded mt-2">
                  <textarea
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder='Enter Comment'
                    className='fw-medium rounded-3 border-0 bg-transparent flex-grow-1'
                    rows={1}
                    style={{
                      resize: 'none',
                      overflow: 'hidden',
                      outline: 'none',
                      boxShadow: 'none',
                      textAlign: 'center',
                      lineHeight: '1.5',
                      minHeight: '50px',
                      padding: '15px 5px',
                      marginRight: '10px', 
                    }}
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-transparent text-primary border-0 d-flex align-items-center"
                    style={{ minHeight: '50px' }} 
                  >
                    <TbSend2 className='fs-3' />
                  </Button>
                </form>
    
  )
}

export default Comment
