import { useContext } from "react";
import ThemeContext, { ThemeContextInterface } from "../context/ThemeContext";

export default function useThemeContext(): ThemeContextInterface {
    return useContext(ThemeContext);
}