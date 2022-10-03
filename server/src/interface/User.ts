export interface Collection {
    [key: number]: number[];
}

export interface User {
    _id: string;
    username: string;
    password: string;
    theme: string;
    email: string;
    platforms: number[];
    games: Collection;
    wishlist: Collection;
}