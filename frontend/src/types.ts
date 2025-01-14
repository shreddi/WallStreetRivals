//Different datatypes for WSR frontend, based on the data received from backend via GET requests. 
//Fields that are generated by backend after creation (id, timecreated, timeupdated, etc) are designated with a '?' so they can be undefined for when we are constructing a new object to be created by the backend
//Django serializes DecimalField as strings, so things like trade_price, total_value, and holdings_value are strings. If desired, this could be changed by using parseFloat in apiService.

//Parent interface that defines common properties shared by all other interfaces in this file.
//These properties include universally applicable fields such as 'id', 'time_created', and 'time_updated'.
export interface ResourceWithMetadata{
    id?: number;
    time_created?: string;
    time_updated?: string;
};


//Interfaces to represent serialized data in backend
export interface Stock extends ResourceWithMetadata{
    ticker: string;
    name: string;
    trade_price: string;
};

export interface Holding extends ResourceWithMetadata{
    stock: number; //numerical id of associated stock. Can be undefined if a holding has a stock added in frontend that is not yet created in backend.
    stock_data?: Stock;
    shares: number;
    total_value?: string; //total value is calculated by serializer in backend.
    portfolio: number //numerical id of associated portfolio
};

export interface Portfolio extends ResourceWithMetadata{
    holdings: Holding[];
    holdings_total: string;
    cash: string;
};

export interface AlertPreferences {
    weekly_summary: boolean;
    daily_summary: boolean;
    contest_rank_change: boolean;
}

export interface Player {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string; //url of static image for user's profile pic
    alert_preferences: AlertPreferences
}


//defaults for each interface
export const defaultStock: Stock = {
    ticker: '',
    name: '',
    trade_price: '0',
}

export const defaultHolding: Holding = {
    stock: 0,
    shares: 0, 
    portfolio: 0
}

export const defaultPortfolio: Portfolio = {
    holdings: [],
    cash: "0",
    holdings_total: "0"
}