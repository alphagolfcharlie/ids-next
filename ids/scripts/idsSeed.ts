import {loadAirports} from "@/scripts/loadAirports";
import {loadAirways} from "@/scripts/loadAirways";
import {loadCrossings} from "@/scripts/loadCrossings";
import {loadEnroutes} from "@/scripts/loadEnroutes";
import {loadFaaRoutes} from "@/scripts/loadFaaRoutes";
import {loadFixes} from "@/scripts/loadFixes";
import {loadNavaids} from "@/scripts/loadNavaids";
import {loadRoutes} from "@/scripts/loadRoutes";
import {loadSids} from "@/scripts/loadSids";
import {loadStars} from "@/scripts/loadStars";

async function main() {
    try {
        await loadAirports();
        await loadAirways();
        await loadCrossings();
        await loadFaaRoutes();
        await loadEnroutes();
        await loadFixes();
        await loadNavaids();
        await loadRoutes();
        await loadSids();
        await loadStars();
        console.log("All scripts finished! Data seeded")
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main()