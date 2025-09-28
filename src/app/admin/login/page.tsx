"use client";
import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function AdminLoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
    const { isAuthenticated, login, loading: authLoading } = useAuth(); // Use useAuth hook

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push("/admin/dashboard");
        }
    }, [isAuthenticated, authLoading, router]);

    if (authLoading) {
        return <div>Loading...</div>; // Or a spinner
    }

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch("http://localhost:8000/api/admin/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
            if (res.ok) {
                const data = await res.json(); // Parse the response to get the token
                login(data.access_token); // Use the login function from AuthContext
            } else {
				const data = await res.json();
				setError(data.detail || "Login failed");
			}
		} catch (err) {
			setError("Network error");
		}
		setLoading(false);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
			<div className="bg-white p-8 rounded shadow w-full max-w-md">
				<h1 className="text-2xl font-bold text-primary mb-6 text-center">Admin Login</h1>
				<form onSubmit={handleSubmit}>
					<input
						type="email"
						placeholder="Email"
						className="w-full mb-4 px-4 py-2 text-gray-800 border rounded"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
					/>
					<input
						type="password"
						placeholder="Password"
						className="w-full mb-6 px-4 text-gray-800 py-2 border rounded"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
					/>
					{error && <div className="text-red-500 mb-4 text-center">{error}</div>}
					<button type="submit" className="w-full bg-primary text-white py-2 rounded font-semibold" disabled={loading}>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</div>
	);
}