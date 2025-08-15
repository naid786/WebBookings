"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, use } from "react";

const NavLink = ({className,...props}:ComponentProps<typeof Link>) => {
    const path = usePathname();
    const isActive = path === props.href || (props.href === "/" && path === "/");
    return (
        <Link className={cn("transition-colors",isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",className)} {...props} />
    );
}

export default NavLink;
