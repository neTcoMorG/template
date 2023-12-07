
export interface Keyword {
    keyword: string,
    rank: number,
    created?: string,
    crawlDate?: string,
}

export interface Sell {
    title: string,
    price: string,
    reviews: number,
    votes: string,
    dc: string,
    keywords: Array<string>
}

export interface Store {
    name: string;
    rank: string;
    totalVisit: string;
    todayVisit: string;
    interest: string;
    sells: Array<Sell>;
    cloud: any;
}