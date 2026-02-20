"use client";

import { useState } from "react";
import { signUpUser } from "@/lib/firebase-services";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code, Loader2 } from "lucide-react";
import Link from "next/link";
import { TagInput } from "@/components/ui/tag-input";
import { skills } from "@/lib/skills";
import {
  MobileTouchInput,
  MobileForm,
  MobileFormGroup,
} from "@/components/mobile-form-optimized";
import { useIsMobile } from "@/lib/responsive";

export default function SignupPage() {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skills_list, setSkillsList] = useState<string[]>([]);
  const [interests_list, setInterestsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting signup...");
      await signUpUser(email, password, {
        name,
        skills: skills_list,
        interests: interests_list,
      });
      console.log("Signup successful, redirecting...");
      router.push("/discover");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader
          className={
            isMobile ? "space-y-2 text-center p-4" : "space-y-2 text-center"
          }
        >
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Code
                className={
                  isMobile ? "h-8 w-8 text-primary" : "h-10 w-10 text-primary"
                }
              />
            </div>
          </div>
          <CardTitle
            className={
              isMobile
                ? "text-2xl font-bold font-headline"
                : "text-3xl font-bold font-headline"
            }
          >
            Create an Account
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Join the community of builders
          </CardDescription>
        </CardHeader>
        <MobileForm onSubmit={handleSignup}>
          <CardContent className={isMobile ? "space-y-4 p-4" : "space-y-4"}>
            <MobileTouchInput
              id="name"
              label="Full Name"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <MobileTouchInput
              id="email"
              type="email"
              label="Email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <MobileTouchInput
              id="password"
              type="password"
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <MobileFormGroup label="Your Skills">
              <TagInput
                placeholder="Search or type and Enter..."
                tags={skills_list}
                setTags={setSkillsList}
                suggestions={skills}
              />
            </MobileFormGroup>

            <MobileFormGroup label="Interests">
              <TagInput
                placeholder="Search or type and Enter..."
                tags={interests_list}
                setTags={setInterestsList}
                suggestions={skills}
              />
            </MobileFormGroup>
            {error && (
              <div
                className={`${isMobile ? "p-2" : "p-3"} rounded-lg bg-destructive/10 border border-destructive/20`}
              >
                <p
                  className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-destructive`}
                >
                  {error}
                </p>
                {error.includes("PERMISSION_DENIED") && (
                  <p className="text-xs mt-1 text-destructive/80">
                    Tip: Ensure Cloud Firestore is enabled and rules allow
                    writes.
                  </p>
                )}
              </div>
            )}
            {loading && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                This may take a moment if the database is initializing...
              </p>
            )}
          </CardContent>
          <CardFooter
            className={
              isMobile ? "flex flex-col gap-3 p-4" : "flex flex-col gap-4"
            }
          >
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            <p className="text-xs md:text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </MobileForm>
      </Card>
    </div>
  );
}
