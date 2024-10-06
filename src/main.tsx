import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen'
import MainLayout from './components/userComponents/MainLayout'

const router = createBrowserRouter([
 {
  path:'/',
  element:<MainLayout/>,
  children:[
    {
      index:true,
      element:<HomeScreen/>
    },
    {
      path:'chat'
    },
    {
      path:'profile'
    },
    {
      path:'notification'
    },
    {
      path:'Roll'
    },
    {
      path:'Explore'
    }
  ]
 }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
<RouterProvider router={router}/>
  </StrictMode>,
)
