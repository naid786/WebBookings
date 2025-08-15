import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/dist/client/link";
import { CalendarDays, CalendarRange } from "lucide-react";
import NavLink from "./nav-link";

export default function Navbar() {

    return (

        // <header className="flex  gap-4 justify-between py-3 font-light">
            <nav className="font-medium flex justify-between items-center text-sm gap-6 container mx-auto">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2 font-semibold mr-auto">
                        <CalendarRange className="size-6" />
                        <span className="sr-only md:not-sr-only">Web Bookings</span>
                    </div>

                    <SignedOut>
                        <nav className="flex items-center gap-4">
                            <Link href={"/features"}>Features</Link>
                            <Link href={"/about"}>About</Link>
                            <Link href={"/contact"}>Contact</Link>
                        </nav>
                    </SignedOut>
                    <SignedIn>
                        <NavLink href="/schedule">
                            Schedule
                        </NavLink>
                        <NavLink href="/events">
                            Events
                        </NavLink>
                    </SignedIn>
                </div>


                <div className="flex items-center gap-2">
                    <SignedOut>
                        <Button asChild>
                            <SignInButton />
                        </Button>
                        <Button variant="outline" asChild>
                            <SignUpButton />
                        </Button>
                    </SignedOut>
                    <SignedIn>
                        <UserButton appearance={{ elements: { userButtonAvatarBox: "size-full" } }} />
                    </SignedIn>
                </div>
            </nav>
        // </header>
    );
}