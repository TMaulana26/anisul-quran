async function inspect37() {
    const res = await fetch("https://api.quran.com/api/v4/verses/by_key/3:7?language=id&translations=33");
    const data = await res.json();
    console.log("Translation text for 3:7:", JSON.stringify(data.verse.translations[0].text));

    // Also let's extract all <sup ...> matches
    const text = data.verse.translations[0].text;
    const matches = Array.from(text.matchAll(/<sup[^>]*>(.*?)<\/sup>/gi));
    for (const m of matches) {
        console.log("Match:", m[0]);
    }
}
inspect37();
