import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                { email, password }
            );

            localStorage.setItem("token", res.data.token);

            const role = res.data.role;
            const emailParam = encodeURIComponent(email);

            if (role === "Admin") {
                navigate(`/admin?email=${emailParam}`);
            } else if (role === "Manager") {
                navigate(`/manager?email=${emailParam}`);
            } else if (role === "Member") {
                navigate(`/member?email=${emailParam}`);
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };


    return (
        <>
            <div className="login-container">
                <form onSubmit={handleLogin} className="login-form">
                    <h2>Login</h2>
                    {error && <p className="error-msg">{error}</p>}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </>
    )
}

export default Login
