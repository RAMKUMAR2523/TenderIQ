import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call delay
    await new Promise(res => setTimeout(res, 1000));
    
    // We mock the successful email sending as requested
    toast.success("If an account exists, a password reset link has been sent.");
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
              <KeyRound className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-base">
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Remember your password? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
