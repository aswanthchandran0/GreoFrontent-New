import Lottie from "lottie-react";
import {  Sparkles, Rss } from 'lucide-react';
import socialConnectAnimation from '../animations/lottie/socialConnect/social connect animation.json';
import socialExperiences from '../animations/lottie/social expirences/Animation - 1738140302253.json'
import { useNavigate } from "react-router-dom";
const LandingPage = ()=>{

    const socialAnimation = socialExperiences
    const connectAnimation = socialConnectAnimation
    const navigate = useNavigate()

  
   
 
      const handleSignUpNavigation =()=> {
        navigate("/auth/signUp")
      }
    return(
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 md:py-16 lg:py-24">
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-purple-900 sm:text-5xl lg:text-6xl sm:mb-6">
                Welcome to Greo
              </h1>
              <p className="max-w-2xl px-4 mx-auto mb-6 text-lg text-gray-600 sm:text-xl sm:mb-8">
                Connect, share, and engage with people who matter. Experience social networking reimagined.
              </p>
              <button onClick={handleSignUpNavigation} className="w-full px-6 py-3 text-lg font-semibold text-white transition-colors bg-purple-600 rounded-full sm:w-auto sm:px-8 hover:bg-purple-700">
                Get Started
              </button>
            </div>
          </div>
        </div>
  
        {/* Feed Section */}
        <div className="py-16 bg-white sm:py-20 lg:py-24">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-2 mb-4">
                  <Rss className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
                  <span className="text-sm font-semibold tracking-wider text-purple-600 uppercase">Smart Feed</span>
                </div>
                <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl sm:mb-6">Your Personalized Social Experience</h2>
                <p className="mb-6 text-lg text-gray-600 sm:text-xl">
                  Stay connected with what matters most. Our intelligent feed learns from your interactions, 
                  delivering content that resonates with your interests and keeps you engaged with your community.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full">
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-base text-gray-600 sm:text-lg">Curated content from people you follow</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full">
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-base text-gray-600 sm:text-lg">Real-time updates from your network</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full">
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-base text-gray-600 sm:text-lg">Discover trending topics in your community</p>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-full max-w-sm mx-auto sm:max-w-md">
                  {
               socialAnimation ? (
                    <Lottie animationData={socialAnimation} loop={true} />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Failed to load animation
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Features Section */}
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-20 lg:py-24">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Why Choose Greo?</h2>
            <p className="max-w-2xl px-4 mx-auto text-lg text-gray-600 sm:text-xl">
              Experience a social platform that puts you in control of your digital social life.
            </p>
          </div>
          {/* <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 sm:gap-12">
            <FeatureCard  
              icon={<Users className="text-purple-600 w-7 sm:w-8 h-7 sm:h-8" />}
              title="Meaningful Connections"
              description="Build genuine relationships with people who share your interests and passions."
            />
            <FeatureCard 
              icon={<Share2 className="text-purple-600 w-7 sm:w-8 h-7 sm:h-8" />}
              title="Seamless Sharing"
              description="Share your moments, thoughts, and experiences with your community effortlessly."
            />
            <FeatureCard 
              icon={<Shield className="text-purple-600 w-7 sm:w-8 h-7 sm:h-8" />}
              title="Privacy First"
              description="Your privacy matters. Advanced security features to keep your data safe and secure."
            />
          </div> */}
        </div>
  
        {/* Connection Section */}
        <div className="py-16 bg-purple-50 sm:py-20 lg:py-24">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
                  <div className="w-full max-w-sm mx-auto sm:max-w-md">
                    {
                       connectAnimation ? (
                      <Lottie animationData={connectAnimation} loop={true} />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        Failed to load animation
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl sm:mb-6">Connect and Grow Together</h2>
                    <p className="mb-6 text-lg text-gray-600 sm:text-xl sm:mb-8">
                      Join a vibrant community where every connection opens new doors. Share your stories, 
                      discover inspiring content, and engage with like-minded individuals who help you grow.
                    </p>
                    <button 
                    onClick={handleSignUpNavigation}
                      className="w-full px-6 py-3 text-lg font-semibold text-white transition-colors bg-purple-600 rounded-full sm:w-auto sm:px-8 hover:bg-purple-700"
                    >
                      Start Connecting
                    </button>
                  </div>
            </div>
          </div>
        </div>
  
        {/* CTA Section */}
        <div className="py-16 text-white bg-purple-900 sm:py-20 lg:py-24">
          <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <div className="inline-block mb-6 sm:mb-8">
              <Sparkles className="w-10 h-10 text-purple-300 sm:w-12 sm:h-12" />
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl sm:mb-6">Ready to Join Greo?</h2>
            <p className="max-w-2xl px-4 mx-auto mb-6 text-lg text-purple-200 sm:text-xl sm:mb-8">
              Join millions of people who are already connecting and sharing on Greo.
            </p>
            <button onClick={handleSignUpNavigation} className="w-full px-6 py-3 text-lg font-semibold text-purple-900 transition-colors bg-white rounded-full sm:w-auto sm:px-8 hover:bg-purple-100">
              Sign Up Now
            </button>
          </div>
        </div>
  
        {/* Footer */}
        <footer className="py-8 bg-white sm:py-12">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center text-gray-500">
              <p className="text-sm sm:text-base">© 2024 Greo. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    )
}

export default LandingPage