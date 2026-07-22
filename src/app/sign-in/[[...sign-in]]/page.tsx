import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearanceInline } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="welcome back"
      title="Sign in to OpenDoor"
      subtitle="Pick up your saved results on any device."
      footer={
        <p>
          New here?{" "}
          <Link href="/sign-up" className="text-accent hover:underline">
            Create a free account
          </Link>
        </p>
      }
    >
      <SignIn
        appearance={clerkAppearanceInline}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/account"
      />
    </AuthShell>
  );
}
