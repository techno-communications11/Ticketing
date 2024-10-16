import React from 'react'
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';

function passwordReUse({handlePasswordToggle,passwordRef,passwordVisibleNew}) {
    return (
        <div>
            <div className='d-flex form-group border rounded'>
                <input type={passwordVisibleNew ? 'text' : 'password'} placeholder='Enter password' className='form-control border-0 shadow-none' ref={passwordRef} />
                <span className='mx-2 mt-1' onClick={handlePasswordToggle} style={{ cursor: 'pointer' }}>
                    {passwordVisibleNew ? <FaRegEye /> : <FaEyeSlash />}
                </span>
            </div>
        </div>
    )
}

export default passwordReUse
