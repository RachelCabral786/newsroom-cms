import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center pt-20 text-primary">
            Newsroom CMS
          </h1>
          <p className="text-center text-gray-600 mt-4">
            Professional Content Management System
          </p>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  )
}

export default App