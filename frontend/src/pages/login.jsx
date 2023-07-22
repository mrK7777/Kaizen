import { useState } from 'react'
import './registration.css'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [form, setForm] = useState({
        email: '',
        password: '',
       
    })

    const [message, setMessage] = useState([{text: '', isError: false}])
    const navigate = useNavigate()

    async function submitForm(event) {
        event.preventDefault()
        if (!form.email || !form.password) {
            return setMessage({text: 'Please fill all the fields!', isError : true })
        }

        
        const result = await fetch ('http://localhost:3000/api/login', {
            headers: {
                'Content-type': 'application/json',
                Accept: 'application/json'
            },    
        method: 'POST',
            body: JSON.stringify(form)
        })
        const message = await result.json()
        if (!result.ok) {
            return setMessage({text: message, isError : true })
        }
        localStorage.setItem('user', JSON.stringify(message))
        return navigate('/dashboard')
        console.log(message)
    }

    return <div>
        <h1>Login</h1>
        <form>
            <input 
            value={form.email} 
            onChange={event => 
                setForm(prev => ({...prev, email: event.target.value}))}
            type="text" 
            id="email" 
            placeholder='Your email'/>
            <input 
            value={form.password}
            onChange={event => 
                setForm(prev => ({...prev, password: event.target.value}))} 
            type="password" 
            id="password" 
            placeholder='Password'/>
            <p>
                New to KANBAN?<a href="/registration"> Register</a>
            </p>
            {message.isError ?<p className='error'>{message.text}</p> : '' }
            <button onClick={submitForm}>Login</button>
        </form>
    </div>
}

export default Login