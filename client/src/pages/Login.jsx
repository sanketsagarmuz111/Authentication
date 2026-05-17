import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import api from '../lib/api'
import LoadingButton from '../components/LoadingButton'

const Login = () => {

  const navigate = useNavigate()

  const {setIsLoggedin, setUserData} = useContext(AppContext)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmitHandler = async(e) =>{
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      if(state === 'Sign Up'){
        const {data} = await api.post('/api/auth/register' , {name,email,password})

        if(data.success){
          setIsLoggedin(true)
          setUserData(data.userData)
          navigate('/')
        } 
        else{
          toast.error(data.message)
        }
      }else{
        const {data} = await api.post('/api/auth/login' , {email,password})

        if(data.success){
          setIsLoggedin(true)
          setUserData(data.userData)
          navigate('/')
        } 
        else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-green-400'>

      <img onClick={()=> navigate('/')} src={assets.logo} className='absolute  left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-green-300 text-sm'> 
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign Up'? 'Create Account' : 'Login'}</h2>
        <p className='text-center text-green-200 text-sm mb-6'>{state === 'Sign Up'? 'Create your account' : 'Login to your account!'}</p>

        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.person_icon} alt="" />
            <input 
            onChange={e => setName(e.target.value)} 
            value={name} 
            className='bg-transparent outline-none w-full' type="text" 
            placeholder='Full Name' required />
          </div>
          )}

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input 
            onChange={e => setEmail(e.target.value)} 
            value={email}
            className='bg-transparent outline-none w-full' type="email" 
            placeholder='Email Id' required />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input 
            onChange={e => setPassword(e.target.value)} 
            value={password}
            className='bg-transparent outline-none' type="password" 
            placeholder='Password' required />
          </div>

          {state === "Login" ? 
          <p onClick={()=>navigate('/reset-password')} className='mb-4 text-green-500 cursor-pointer'>Forgot password?</p>
          :
          <p></p>  }

          <LoadingButton type='submit' isLoading={isSubmitting} loadingText={state === 'Sign Up' ? 'Creating...' : 'Logging in...'} className='w-full py-2.5 rounded-full bg-gradient-to-r from-green-400 to-green-800 text-white font-medium'>{state}</LoadingButton>
        </form>

        {state === "Sign Up" ? (
          
          <p className='text-gray-400 text-center text-xs mt-4'>Already have an account?
            <span onClick={()=> setState("Login")} className='ml-1 text-green-400 cursor-pointer underline'>Login here</span>
          </p>
        ):(
          <p className='text-gray-400 text-center text-xs mt-4'>Don&apos;t have an account?
           <span onClick={()=> setState("Sign Up")} className='ml-1 text-green-400 cursor-pointer underline'>Sign Up</span>
          </p>
        )}


      </div>
    </div>
  )
}

export default Login
