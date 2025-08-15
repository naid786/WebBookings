"use client";

import Link from "next/link";
import { Button } from "./ui/button";

const Hero = () => {
    return (
        <section className="text-center mt-24">
            <h1 className="text-4xl font-bold mb-6">
                <span className="text-blue-500">Bookings </span>made simple.<br />
                Your schedule, <span className="text-blue-500">your way</span>
            </h1>
            <p>
                Effortlessly manage your bookings with simple solution.<br />
                Stay organized, save time, and never miss an important event.<br />
                Join now to experience seamless scheduling and hassle-free management!
            </p>
            <div className="mt-4 flex gap-4 justify-center">
                <Button className="py-2 px-4 rounded-full" >
                    <Link href={"/"} >Get Started</Link>
                </Button>
            </div>
        </section>
    );
}
 
export default Hero;