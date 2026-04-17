import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/Middle/Hook/Use-Toast";
import { supabase } from "@/Bottom/Integration/Supabase/client";
import { z } from "zod";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12 px-4">
          <div className="w-full max-w-md">
            <div className="glass-card p-8 sm:p-10">
              <div className="glass-content space-y-8 text-center">
                <div className="flex justify-center">
                  <div className="glass-icon-btn w-16 h-16 pointer-events-none bg-primary/10">
                    <CheckCircle className="h-7 w-7 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>

                <Link
                  to="/Sign-In"
                  className="glass-btn inline-flex items-center justify-center gap-2 w-full py-4 text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 sm:p-10">
            <div className="glass-content space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="glass-icon-btn w-16 h-16 pointer-events-none">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Forgot Password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-input pl-12 pr-4 py-3.5 text-sm rounded-xl placeholder:text-muted-foreground/60"
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-destructive mt-1">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="glass-btn w-full py-4 bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl"
                >
                  {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                  Send Reset Link
                </button>
              </form>

              {/* Back to Sign In */}
              <Link
                to="/Sign-In"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
