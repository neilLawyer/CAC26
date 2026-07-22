import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearanceInline } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="free, optional account"
      title="Save your results"
      subtitle="Come back later, from any device, right where you left off."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <SignUp
        appearance={clerkAppearanceInline}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/account"
      />
    </AuthShell>
  );
}
