import { useState } from "react";
import "./registration.css";
import { useNavigate } from "react-router-dom";

function Registration() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar_url: "",
    password: "",
    repeatePassword: "",
  });

  const [message, setMessage] = useState([{ text: "", isError: false }]);
  const navigate = useNavigate();

  async function submitForm(event) {
    event.preventDefault();
    if (!form.name || !form.email || !form.password || !form.repeatePassword) {
      return setMessage({ text: "Please fill all the fields!", isError: true });
    }

    if (form.password !== form.repeatePassword) {
      return setMessage({ text: "Passwords don not match", isError: true });
    }

    const result = await fetch("http://localhost:3000/api/registration", {
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: JSON.stringify(form),
    });

    const message = await result.json();
    if (!result.ok) {
      return setMessage({ text: message, isError: true });
    }
    return navigate("/login");
  }

  return (
    <div>
      <h1>Registration</h1>
      <form>
        <input
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          type="text"
          id="name"
          placeholder="Your name"
        />
        <input
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          type="text"
          id="email"
          placeholder="Your email"
        />

        <input
          value={form.avatar_url}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, avatar_url: event.target.value }))
          }
          type="text"
          id="avatar"
          placeholder="Avatar URL"
        />
        <input
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          type="password"
          id="password"
          placeholder="Password"
        />
        <input
          value={form.repeatePassword}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              repeatePassword: event.target.value,
            }))
          }
          type="password"
          id="repeatPassword"
          placeholder="Repeat password"
        />
        <p>
          Already have an account <a href="/login">Login</a>
        </p>
        {message.isError ? <p className="error">{message.text}</p> : ""}
        <button onClick={submitForm}>Register</button>
      </form>
    </div>
  );
}

export default Registration;
