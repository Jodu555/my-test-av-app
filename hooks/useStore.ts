import { AuthInfoResponse, Episode, Lang, Movie, Serie } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface Store {
    series: Serie[];
    selectedSerieID?: string;
    loading: boolean;

    currentMovie: number;
    currentSeason: number;
    currenteEpisode: number;
    currentLanguage: Lang;
    error: string;

    watchList: WatchItem[];

    authToken: string;
    authInfo: AuthInfoResponse;

    setSelectedSerieID: (ID: string) => void;

    login: (username: string, password: string) => Promise<void>;
    authenticate: () => Promise<void>;
    logout: () => Promise<void>;

    getSelectedSerie: () => Serie | undefined;
    fetchSeriesList: () => Promise<void>;
    fetchSeriesInfo: (ID: string) => Promise<void>;
    fetchWatchList: () => Promise<void>;

    onMovieChange: (movie: number) => void;
    onSeasonChange: (season: number) => void;
    onEpisodeChange: (episode: number) => void;
    onLanguageChange: (lang: Lang) => void;

    getEntityObject: () => Episode | Movie | undefined;
    checkAndUpdateLang: () => void;
}

interface WatchItem {
    ID: string;
    season: number;
    episode: number;
    movie: number;
    time: number;
    watched: boolean;
}


const BASE_URL = 'https://cinema-api.jodu555.de';

// Define the store
const useStore = create<Store>((set, get) => ({
    series: [],
    selectedSerieID: undefined,
    loading: false,
    error: '',

    authToken: '',
    authInfo: {} as AuthInfoResponse,

    currentMovie: -1,
    currentSeason: 1,
    currenteEpisode: 1,
    currentLanguage: 'GerDub' as Lang,

    watchList: [],

    setSelectedSerieID: (ID: string) => set({ selectedSerieID: ID }),


    login: async (username: string, password: string) => {
        set({ loading: true });
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });
            const json = await response.json();
            set({ authToken: json.token });
            await AsyncStorage.setItem('authToken', json.token);
        } catch (error) {
            set({ error: JSON.stringify(error) + (error as any).message });
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
    authenticate: async () => {
        try {
            const authToken = await AsyncStorage.getItem('authToken');

            console.log('authenticating with authToken', authToken);
            if (authToken) {
                set({ authToken });
            }

            const response = await fetch(`${BASE_URL}/auth/info`, {
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': get().authToken,
                },
            });
            const json = await response.json() as AuthInfoResponse;
            console.log('authInfo', json);
            set({ authInfo: json });
        } catch (error) {
            set({ error: JSON.stringify(error) + (error as any).message });
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
    logout: async () => {
        set({ authToken: '' });
        await AsyncStorage.removeItem('authToken');
    },
    getSelectedSerie: () => {
        return get().series.find(serie => serie.ID === get().selectedSerieID);
    },
    fetchSeriesList: async () => {
        set({ loading: true });
        try {
            const response = await fetch(`${BASE_URL}/index?auth-token=${get().authToken}`);
            const json = await response.json();
            set({ series: json });
        } catch (error) {
            set({ error: JSON.stringify(error) + (error as any).message });
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
    fetchSeriesInfo: async (ID: string) => {
        set({ loading: true });
        console.log('fetchSeriesInfo', ID, get().selectedSerieID);

        try {
            const response = await fetch(`${BASE_URL}/index/${ID}?auth-token=${get().authToken}`);
            const json = await response.json();
            console.log('fetchSeriesInfo', json);
            set({
                series:
                    get().series.map(serie => {
                        if (serie.ID === ID) {
                            return { ...serie, ...json };
                        } else {
                            return serie;
                        }
                    })
            });
            console.log('fetchSeriesInfo', get().selectedSerieID, get().getSelectedSerie());
        } catch (error) {
            set({ error: JSON.stringify(error) });
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
    fetchWatchList: async () => {
        set({ loading: true });
        try {
            const response = await fetch(`${BASE_URL}/watch/info?series=${get().selectedSerieID}&auth-token=${get().authToken}`);
            const json = await response.json();
            console.log(json);
            set({ watchList: json });
        } catch (error) {
            set({ error: JSON.stringify(error) });
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    onMovieChange: (movie: number) => {
        set({ currenteEpisode: -1, currentSeason: 0, currentMovie: movie });
        get().checkAndUpdateLang();
    },
    onSeasonChange: (season: number) => {
        set({ currenteEpisode: 1, currentSeason: season });
        get().checkAndUpdateLang();
    },
    onEpisodeChange: (episode: number) => {
        set({ currenteEpisode: episode });
        get().checkAndUpdateLang();
    },
    onLanguageChange: (lang: Lang) => {
        set({ currentLanguage: lang });
        get().checkAndUpdateLang();
    },

    getEntityObject: () => {
        if (get().currentMovie !== -1) {
            return get().series.find(serie => serie.ID === get().selectedSerieID)?.movies[get().currentMovie - 1];
        } else {
            return get().series.find(serie => serie.ID === get().selectedSerieID)?.seasons[get().currentSeason - 1][get().currenteEpisode - 1];
        }
    },

    checkAndUpdateLang: () => {
        const entity = get().getEntityObject();
        console.log(`Current Language: ${get().currentLanguage}, Available Languages: ${entity?.langs.join(', ')}`);

        if (entity?.langs.includes(get().currentLanguage)) {
            return set({
                currentLanguage: get().currentLanguage
            });
        } else {
            return set({
                currentLanguage: entity?.langs[0]
            });
        }
    },
}));

export default useStore;