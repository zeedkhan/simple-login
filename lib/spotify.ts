import SpotifyWebAPI from "spotify-web-api-node"

const scopes = [
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "streaming",
    "user-read-private",
    "user-library-read",
    "user-top-read",
    "user-library-modify",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-follow-read"
];

const queryParamString = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT as string,
    client_secret: process.env.SPOTIFY_SECRET as string,
    grant_type: 'client_credentials',
    scope: scopes.join(','),
});

const LOGIN_URL = `https://accounts.spotify.com/authorize?${queryParamString}`;


const spotifyAPI = new SpotifyWebAPI({
    clientId: process.env.SPOTIFY_CLIENT as string,
    clientSecret: process.env.SPOTIFY_SECRET as string,
});

async function refreshAccessToken(token: any): Promise<any> {

    try {
        spotifyAPI.setAccessToken(token.access_token as string)
        spotifyAPI.setRefreshToken(token.refresh_token as string)

        const { body: data } = await spotifyAPI.refreshAccessToken();
        return {
            ...token,
            access_token: data.access_token,
            expires_at: Date.now() + data.expires_in * 1000,
            refresh_token: data.refresh_token ?? token.refresh_token,
        }

    } catch (error) {
        console.error(error);

        return {
            ...token,
            error: "RefreshAccessTokenError"
        }
    }
}

export default spotifyAPI;

export {
    LOGIN_URL,
    refreshAccessToken
}
