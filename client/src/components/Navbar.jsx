import { useContext, useState } from 'react'
import {assets} from "../assets/assets"
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import api from '../lib/api'
import LoadingButton from './LoadingButton'

const Navbar = () => {

    const navigate = useNavigate()
    const {userData, setUserData, setIsLoggedin} = useContext(AppContext)
    const [loadingAction, setLoadingAction] = useState('')

    const sendVerificationOtp = async()=>{
      if (loadingAction) return

      try {
        setLoadingAction('verify')

        const {data} = await api.post('/api/auth/send-verify-otp')

        if(data.success){
          navigate('/email-verify')
          toast.success(data.message)
        }
        else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoadingAction('')
      }
    }

    const logout = async() =>{
      if (loadingAction) return

      try {
        setLoadingAction('logout')
        const {data} = await api.post('/api/auth/logout')
        data.success && setIsLoggedin(false)
        data.success && setUserData(false)
        navigate('/')

      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoadingAction('')
      }
    }


  return (
    <div className='w-full flex justify-between items-center p-6 sm:p-8 sm:px-24 absolute top-0'>

      <img src={assets.logo} className='w-32 sm:w-32'/>

      {userData ?
      <div className='w-12 h-12 flex justify-center items-center rounded-full text-2xl bg-green-500 text-white relative group'>
        {userData.name[0].toUpperCase()}
        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
          <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
            {!userData.isAccountVerified && 
            <li>
              <button onClick={sendVerificationOtp} disabled={Boolean(loadingAction)} className='w-full py-1 px-2 text-left hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-70'>
                {loadingAction === 'verify' ? 'Sending...' : 'Verify email'}
              </button>
            </li>
            }     
            <li>
              <button onClick={logout} disabled={Boolean(loadingAction)} className='w-full py-1 px-2 pr-10 text-left hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-70'>
                {loadingAction === 'logout' ? 'Logging out...' : 'Logout'}
              </button>
            </li>
          </ul>
        </div>
      </div>
      :
      <LoadingButton onClick={()=>navigate("/login")} className='flex items-center gap-2 border border-green-500 rounded-full px-6 py-2 text-green-800 hover:bg-green-100 transition-all'>Login 
        <img src={assets.arrow_icon} alt="" />
      </LoadingButton>
      }
    </div>
  )
}

export default Navbar
