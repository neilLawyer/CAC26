import { clerkMiddleware } from "@clerk/nextjs/server";

// Auth state only — nothing is gated here. The guest flow (intake, results,
// cliff-simulator, packet) stays fully public; the one real access check is
// inside src/app/api/account/screening/route.ts.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
