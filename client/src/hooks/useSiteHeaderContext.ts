import { useContext } from "react";
import SiteHeaderContext, { useSiteHeaderContextInterface } from "../context/SiteHeaderContext";

export default function useSiteHeaderContext(): useSiteHeaderContextInterface {
    return useContext(SiteHeaderContext);
}