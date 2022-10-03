import { Dispatch, SetStateAction } from 'react';
import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';

export interface useSearchInterface {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    handleSearch: (event: FormEvent) => void;
}

export default function useSearch(predefined: string = ""): useSearchInterface {
    const [term, setTerm] = useState<string>(predefined);
    const history = useHistory();

    const handleSearch = (event: FormEvent): void => {
        event.preventDefault();
        if(term.length === 0) {
            return;
        }

        setTerm("");
        history.push({
            pathname: "/search",
            search: "?term=" + encodeURIComponent(term)
        });
    }

    return {
        searchTerm: term,
        setSearchTerm: setTerm,
        handleSearch: handleSearch
    }
}