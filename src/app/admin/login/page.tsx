"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield } from "lucide-react";
import Image from "next/image";
import LOGO from "../../../../public/loguss.png";

export default function AdminLoginPage() {
	const [email, setEmail] = useState("admin@typs.dev");
	const [password, setPassword] = useState("123");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { signIn } = useAuth();

	// The middleware will handle redirects automatically
	// No need for manual redirects here to prevent loops

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		console.log('Login attempt with:', { email, password });
		setLoading(true);
		setError("");
		
		try {
			console.log('Calling signIn...');
			await signIn(email, password);
			console.log('SignIn successful!');
			
			// Force redirect after successful login
			console.log('Redirecting to dashboard...');
			window.location.href = '/admin/dashboard';
		} catch (error) {
			console.error('Login error:', error);
			setError(error instanceof Error ? error.message : "Invalid credentials");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
			<div className="w-full max-w-md">
				{/* Logo and Header */}
				<div className="text-center mb-8">
					<div className="mx-auto mb-6 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
						<Image
							src={LOGO}
							alt="AISB Logo"
							width={60}
							height={60}
							className="rounded-xl"
						/>
					</div>
					<h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
					<p className="text-slate-600">Sign in to your admin dashboard</p>
				</div>

				{/* Login Card */}
				<Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
					{/* <CardHeader className="space-y-1 pb-4">
						<CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
							<Shield className="h-5 w-5 text-blue-600" />
							Admin Access
						</CardTitle>
						<CardDescription className="text-center text-slate-600">
							Enter your credentials to continue
						</CardDescription>
					</CardHeader> */}
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium text-slate-700">
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="admin@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm font-medium text-slate-700">
									Password
								</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary"
								/>
							</div>

							{error && (
								<Alert className="border-red-200 bg-red-50">
									<AlertDescription className="text-red-800">
										{error}
									</AlertDescription>
								</Alert>
							)}

							<Button
								type="submit"
								disabled={loading}
								className="w-full h-11 bg-primary hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Signing in...
									</>
								) : (
									"Sign In"
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="text-center mt-8">
					<p className="text-sm text-slate-600">
						AI Skill Bridge - Admin Portal
					</p>
					<p className="text-xs text-slate-500 mt-1">
						Secure access to management dashboard
					</p>
				</div>
			</div>
		</div>
	);
}