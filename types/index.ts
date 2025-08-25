export interface Serie {
    ID: string;
    categorie: string;
    title: string;
    seasons: [[Episode]];
    movies: [Movie];
    infos: {
        infos: string;
        startDate: string;
        endDate: string;
        description: string;
    };
}

export type Lang = 'GerDub' | 'GerSub' | 'EngDub' | 'EngSub' | 'GerSubK' | 'EngSubK';

export interface Movie {
    filePath: string;
    primaryName: string;
    secondaryName: string;
    langs: Lang[];
    subID: string;
}

export interface Episode {
    filePath: string;
    primaryName: string;
    secondaryName: string;
    season: number;
    episode: number;
    langs: Lang[];
    subID: string;
}

export interface AuthInfoResponse {
    UUID: string;
    activityDetails: string;
    email: string;
    role: number;
    settings: string;
    username: string;
}

export interface activityDetails {
    lastIP: string;
    lastHandshake: string;
    lastLogin: string;
}