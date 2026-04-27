export function getYouTubeEmbedUrl(url: string) {
    try {
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
    } catch (e) {
        console.error("Erreur parsing YouTube URL:", e);
    }
    return url; // si échec, retourne le lien tel quel
}
