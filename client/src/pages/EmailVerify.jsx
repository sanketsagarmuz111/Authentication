import { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../lib/api'
import LoadingButton from '../components/LoadingButton'

const EmailVerify = () => {

  const {isLoggedin, userData, getUserData} = useContext(AppContext)
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInput = (e, index) =>{
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1){
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) =>{
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char,index)=>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char
      }
    })
  }

  const onsubmitHandle = async(e)=>{
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')

      const {data} = await api.post('/api/auth/verify-account', {otp})
      if(data.success){
        toast.success(data.message)
        await getUserData({ showError: false })
        navigate('/')
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(()=>{
    isLoggedin && userData && userData.isAccountVerified && navigate('/')
  },[isLoggedin, navigate, userData])

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-green-400'>
      <img onClick={()=> navigate('/')} src={assets.logo} className='absolute  left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />

      <form className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm' onSubmit={onsubmitHandle}>

        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
        <p className='text-center mb-6 text-green-300'>Enter the 6-digit code sent to your email id.</p>

        <div className='flex justify-between mb-8' onPaste={handlePaste}>

          {Array(6).fill(0).map((_,index)=>(
            <input type='text' maxLength='1' key={index} required className='w-12 h-12 bg-[#a2c4b2] text-green-800 text-center text-xl rounded-md' 
            ref={e=>inputRefs.current[index] = e}
            onInput={(e)=> handleInput(e, index)}
            onKeyDown={(e)=> handleKeyDown(e, index)}
            />
          ))}
        </div>
        <LoadingButton type='submit' isLoading={isSubmitting} loadingText='Verifying...' className='w-full py-3 bg-gradient-to-r from-green-400 to-green-800 text-white rounded-full'>Verify email</LoadingButton>
      </form>
    </div>
  )
}
 
export default EmailVerify
