"use client"

import { Tabs, TabsTrigger, TabsContent, TabsList} from "@/components/ui/tabs"
import {RoutesForm} from "@/components/query/routesForm";
import {CrossingsInput} from "@/components/query/crossingsForm";
import {EnrouteInput} from "@/components/query/enroutesForm";
import {StatusCards} from "@/components/query/statusCards";
import dynamic from "next/dynamic";
import {RoutePlannerProvider} from "@/components/map/routePlannerContext";
import {DtwWaypoints} from "@/components/query/waypoints";
import {FlowProvider} from "@/components/query/flowContext";

const MapView = dynamic(
    () => import("@/components/map/mapView").then((mod) => mod.MapView),
    { ssr: false }
);

export default function IDSPage() {
    return (
        <RoutePlannerProvider>
            <FlowProvider>
                <div className="min-h-screen flex flex-col">
                    <div className="flex flex-col md:flex-row flex-1">
                        <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto space-y-10 border-r">
                            <Tabs defaultValue="routing">
                                <TabsList className="w-full justify-center">
                                    <TabsTrigger value="routing">Routing</TabsTrigger>
                                    <TabsTrigger value="crossings">Ext. LOAs</TabsTrigger>
                                    {/*<TabsTrigger value="internalcrossings">Int. LOAs</TabsTrigger>*/}
                                    <TabsTrigger value="info">ATIS/WX</TabsTrigger>
                                    <TabsTrigger value="waypoints">ROTG</TabsTrigger>
                                </TabsList>
                                <br />
                                <TabsContent value="routing">
                                    <RoutesForm />
                                </TabsContent>
                                <TabsContent value="crossings">
                                    <CrossingsInput />
                                </TabsContent>
                                {/*<TabsContent value="internalcrossings">
                                    <EnrouteInput />
                                </TabsContent>*/}
                                <TabsContent value="info">
                                    <StatusCards />
                                </TabsContent>
                                <TabsContent value="waypoints">
                                    <DtwWaypoints />
                                </TabsContent>

                            </Tabs>
                        </div>

                        <div className="w-full md:w-1/2 p-4 md:p-6 ">
                            <MapView />
                        </div>
                    </div>
                </div>
            </FlowProvider>
        </RoutePlannerProvider>
    )
}