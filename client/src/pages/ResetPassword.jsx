import { useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../lib/api'
import LoadingButton from '../components/LoadingButton'

const ResetPassword = () => {

  const navigate = useNavigate()
  const inputRefs = useRef([])
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSubmited, setIsOtpSubmited] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')

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

  const onSubmitEmail = async(e)=>{
    e.preventDefault()
    if (loadingStep) return

    try {
      setLoadingStep('email')
      const {data} = await api.post('/api/auth/send-reset-otp',{email})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && setIsEmailSent(true)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoadingStep('')
    }
  }

  const onSubmitOTP = async(e) =>{
    e.preventDefault()
    const otpArray = inputRefs.current.map((e)=> e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmited(true)
  }

  const onSubmitNewPassword = async(e) =>{
    e.preventDefault()
    if (loadingStep) return

    try {
      setLoadingStep('password')
      const {data} = await api.post('/api/auth/reset-password',{email,otp,newPassword})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/login')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoadingStep('')
    }
  }
  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-green-400'>
      <img onClick={()=> navigate('/')} src={assets.logo} className='absolute  left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />


      {/* enter email id */}

      {!isEmailSent && 

      <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
        <p className='text-center mb-6 text-green-200'>Enter your registered email address</p>

        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
          <img src={assets.mail_icon} className='w-3 h-3' />
          <input type="email" placeholder='Email Id' className='bg-transparent w-full outline-none text-green-300' value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <LoadingButton type='submit' isLoading={loadingStep === 'email'} loadingText='Sending...' className='w-full py-3 bg-gradient-to-r from-green-400 to-green-800 text-white rounded-full' >Submit</LoadingButton>
      </form>
      }


      {/* otp input form */}

      {!isOtpSubmited && isEmailSent && 
      <form onSubmit={onSubmitOTP} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>

        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password OTP</h1>
        <p className='text-center mb-6 text-green-200'>Enter the 6-digit code sent to your email id.</p>

        <div className='flex justify-between mb-8' onPaste={handlePaste}>

          {Array(6).fill(0).map((_,index)=>(
            <input type='text' maxLength='1' key={index} required className='w-12 h-12 bg-[#a2c4b2] text-green-800 text-center text-xl rounded-md' 
            ref={e=>inputRefs.current[index] = e}
            onInput={(e)=> handleInput(e, index)}
            onKeyDown={(e)=> handleKeyDown(e, index)}
            />
          ))}
        </div>
        <LoadingButton type='submit' className='w-full py-2.5 bg-gradient-to-r from-green-400 to-green-800 text-white rounded-full'>Submit</LoadingButton>
      </form>

      }


      {/* enter new password  */}

      {isOtpSubmited && isEmailSent && 

      <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
        <p className='text-center mb-6 text-green-300'>Enter the new password below</p>

        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
          <img src={assets.lock_icon} className='w-3 h-3' />
          <input type="password" placeholder='Password' className='bg-transparent outline-none text-green-300' value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required />
        </div>
        <LoadingButton type='submit' isLoading={loadingStep === 'password'} loadingText='Resetting...' className='w-full py-3 bg-gradient-to-r from-green-400 to-green-800 text-white rounded-full' >Submit</LoadingButton>
      </form>
      }
    </div>
  )
}

export default ResetPassword
