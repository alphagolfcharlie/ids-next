"use client";

import * as React from "react";


export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 lg:px-8 py-12">
                {/*<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Plane className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Virtual Cleveland ARTCC</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The crossroads of the virtual NAS, providing ATC services on the VATSIM network.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/events" className="text-muted-foreground hover:text-primary transition-colors">
                                    Upcoming Events
                                </a>
                            </li>
                            <li>
                                <a href="/roster" className="text-muted-foreground hover:text-primary transition-colors">
                                    Controller Roster (requires sign-in)
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    Charts
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    SOPs
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    Documentation
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Connect</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/discord" className="text-muted-foreground hover:text-primary transition-colors">
                                    Discord
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    Our Staff
                                </a>
                            </li>
                        </ul>
                    </div>
                </div> */}

                <div className="text-center text-sm text-muted-foreground">
                    <p>Site by Arya Chandrasekharan. These are not official materials of the virtual Cleveland ARTCC, nor the FAA, and are not for real-world use.</p>
                </div>
            </div>
        </footer>

        //{/* Optional: separator */}
        //<Separator className="my-6 border-sky-700 dark:border-sky-300" />

        //<p className="text-center text-xs text-gray-500 dark:text-gray-500">
        //  &copy; {new Date().getFullYear()} Virtual Cleveland ARTCC. All rights reserved.
        //</p>
        //</footer>
    );
}
