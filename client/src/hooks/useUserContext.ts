import { useContext } from "react";
import UserContext, { UserContextInterface } from "../context/UserContext";

export default function useUserContext(): UserContextInterface {
    return useContext(UserContext);
}