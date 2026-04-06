import React from 'react'
import Hero from '../components/Hero'
import FreaturedDestination from '../components/FreaturedDestination'
import Exclusiveoffers from '../components/Exclusiveoffers'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/Newsletter'
import RecommendedHotel from '../components/RecommendedHotel'

const Home = () => {
  return (
    <>
    <Hero/>
    <RecommendedHotel/>
    <FreaturedDestination/>
    <Exclusiveoffers/>
    <Testimonial/>
    <Newsletter/>
    </>
  )
}

export default Home