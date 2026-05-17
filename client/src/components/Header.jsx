import { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import LoadingButton from './LoadingButton'
 
const Header = () => {

  const {userData} = useContext(AppContext)
  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>

      <img src={assets.header_img} className='w-40 h-40 rounded-full mb-6'/>

      <h1 className='flex items-center gap-2 text-green-500 text-xl sm:text-3xl font-medium mb-2'>
      <p className='text-green-800'>Hey {userData ? userData.name : 'Developer' }  </p>
        <img src={assets.hand_wave} className='w-8 aspect-square'/></h1>

      <h2 className='text-3xl sm:text-5xl text-green-500 font-semibold mb-4'>Welcome to our auth</h2>

      <p className='mb-8 max-w-md'>Let&apos;s start with a quick product tour and we will have you up and running in no time!</p>

      <LoadingButton className='border border-green-500 rounded-full px-8 py-2.5 hover:bg-green-100 transition-all'>Get Started</LoadingButton>
    </div>
  )
}

export default Header
