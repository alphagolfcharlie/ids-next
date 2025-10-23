"use client"

import * as React from "react"
import Link from "next/link"
import { useEffect, useState } from "react";
import {ExternalLink, CodeXml, MenuIcon, BookText} from "lucide-react"
import { CalendarClockIcon, LandPlotIcon, FileSliders } from "lucide-react"
import { ModeToggle } from "@/components/ui/modeToggle"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"


export function Navbar() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    return (
        <div className="p-4 border-b border-sky-900 dark:border-sky-50 flex items-center justify-between z-10 bg-white dark:bg-black sticky top-0">
            {/* Left: Navigation Menu */}
            <div className="hidden md:flex items-center">
                <NavigationMenu viewport={false}>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    External Links
                                </div>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[200px] gap-4">
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <a target="_blank" href="https://refs.clevelandcenter.org">
                                                <div className="font-medium flex items-center gap-2">
                                                    <FileSliders className="w-4 h-4" />
                                                    vZOB References
                                                </div>
                                            </a>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <a target="_blank" href="https://clevelandcenter.org/splits">
                                                <div className="font-medium flex items-center gap-2">
                                                    <LandPlotIcon className="w-4 h-4" />
                                                    Active Split
                                                </div>
                                            </a>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <a target="_blank" href="https://clevelandcenter.org/downloads">
                                                <div className="font-medium flex items-center gap-2">
                                                    <BookText className="w-4 h-4" />
                                                    SOPs/LOAs
                                                </div>
                                            </a>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <a target="_blank" href="https://github.com">
                                                <div className="font-medium flex items-center gap-2">
                                                    <CodeXml className="w-4 h-4" />
                                                    Github
                                                </div>
                                            </a>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                    </NavigationMenuList>
                </NavigationMenu>
            </div>


            {/* --- Mobile Navigation (Hamburger + Sheet Drawer) --- */}
            <div className="flex md:hidden items-center">
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                            <MenuIcon className="w-5 h-5" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 sm:w-80 bg-white dark:bg-black">
                        <SheetHeader>
                            <SheetTitle className="text-left font-semibold text-lg px-2">Menu</SheetTitle>
                        </SheetHeader>

                        <div className="mt-4 px-3 space-y-2">
                            <Link
                                href="/"
                                className="block w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Home
                            </Link>

                            <Accordion type="single" className="space-y-1" collapsible>
                                {/* === Pilots === */}
                                <AccordionItem value="pilots">
                                    <AccordionTrigger className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <p>Pilots</p>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-4 space-y-1 mt-1">
                                        {[
                                            { href: "/pilots/feedback", label: "Controller Feedback" },
                                            { href: "/pilots/briefing", label: "Pilot Briefing" },
                                            { href: "/pilots/routing", label: "ATC Routing" },
                                        ].map((item) => (
                                            <SheetTrigger key={item.href} asChild>
                                                <Link
                                                    href={item.href}
                                                    className="block w-full px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            </SheetTrigger>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>

                                {/* === Controllers === */}
                                <AccordionItem value="controllers">
                                    <AccordionTrigger className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <p>Controllers</p>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-4 space-y-1 mt-1">
                                        {[
                                            { href: "/roster", label: "Controller Roster" },
                                            { href: "/ids", label: "IDS" },
                                            { href: "https://refs.clevelandcenter.org", label: "References", external: true },
                                        ].map((item) => (
                                            <SheetTrigger key={item.href} asChild>
                                                <Link
                                                    href={item.href}
                                                    target={item.external ? "_blank" : "_self"}
                                                    className="block w-full px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            </SheetTrigger>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>

                                {/* === Events === */}
                                <AccordionItem value="events">
                                    <AccordionTrigger className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <p>Events</p>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-4 space-y-1 mt-1">
                                        {[
                                            { href: "/events", label: "Upcoming Events" },
                                            { href: "/ids", label: "Active Split" },
                                        ].map((item) => (
                                            <SheetTrigger key={item.href} asChild>
                                                <Link
                                                    href={item.href}
                                                    className="block w-full px-4 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            </SheetTrigger>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Right: Mode Toggle */}
            <div className="ml-auto">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <ModeToggle />
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

            </div>

        </div>
    )
}
