/* eslint-disable @typescript-eslint/no-unused-vars */
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'

const Header = () => {
const {user,isSignedIn}=useUser()

const navLinks=[
{label:'Home', link:'/'},
{label:'Search', link:'/search'},
{label:'New', link:'/search?cars=New'},
{label:'Used', link:'/search?cars=Used'},
]
  return (
    <div className='flex justify-between items-center py-2 px-4 md:p-5 shadow'>
    <Link to='/' className='flex items-center gap-2'>
    <img src="/logo.svg" alt="logo" width={35} />
    <h1 className='text-xl md:text-2xl font-bold uppercase text-[#3538CD] line-clamp-1'>Triumphant Cars</h1>
    </Link>
<ul className='hidden md:flex items-center gap-10'>
{navLinks.map((navLink,i)=>(
<li key={i} className='font-medium hover:scale-105 transition-all cursor-pointer hover:text-primary'><Link to={navLink.link}>
{navLink.label}
</Link></li>
))}
</ul>

{isSignedIn?
<div className='flex items-center gap-4'>
<UserButton/>
<Link to='/profile'>
<Button className='bg-primary rounded text-white'>My Listing</Button>
</Link>
</div>:
    <SignInButton mode='modal' forceRedirectUrl='/'>
    <Button className='bg-primary rounded text-white'>Sign In</Button>
    </SignInButton>
}
    </div>
  )
}

export default Header