import {loadAirports} from "@/scripts/loadAirports";
import {loadAirways} from "@/scripts/loadAirways";
import {loadFaaRoutes} from "@/scripts/loadFaaRoutes";
import {loadFixes} from "@/scripts/loadFixes";
import {loadNavaids} from "@/scripts/loadNavaids";
import {loadSids} from "@/scripts/loadSids";
import {loadRoutes} from "@/scripts/loadRoutes";
import {loadStars} from "@/scripts/loadStars";

async function main() {
    try {
        await loadAirports();
        await loadAirways();
        await loadRoutes();
        await loadFaaRoutes();
        await loadFixes();
        await loadNavaids();
        await loadSids();
        await loadStars();
        console.log("All scripts finished! Navdata updated.")
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main()