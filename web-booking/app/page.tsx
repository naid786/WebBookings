import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId != null) redirect("/events");

  
  return (
    <main>
      <Navbar />
      <Hero />
    </main>
  );
}
