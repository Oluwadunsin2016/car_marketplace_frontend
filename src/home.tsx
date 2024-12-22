
import Category from './components/Category'
import Hero from './components/Hero'
import InfoSection from './components/InfoSection'
import MostSearchedCars from './components/MostSearchedCars'

const Home = () => {


  return (
    <div>
    {/* Hero */}
    <Hero/>

    {/* Category */}
    <Category/>
    
    {/* MostSearchedCar */}
    <MostSearchedCars/>

    {/* InfoSection */}
    <InfoSection/>
    
    </div>
  )
}

export default Home