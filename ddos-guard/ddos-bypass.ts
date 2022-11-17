import ddos from "@cantfindkernel/ddos-guard-bypass";
import config from "../kdmid-checker.config";

export const bypassDdosGuardHeaders = async () => {
    console.log('bypassDdosGuardHeaders...')

    const ddgu = await ddos.bypass(config.link_to_kdmid);

    console.log('bypassDdosGuardHeaders done')
    console.log("ddgu", JSON.stringify(ddgu));

    return ddgu.headers
}
