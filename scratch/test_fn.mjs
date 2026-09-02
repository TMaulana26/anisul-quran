async function fetchFn() {
    const res = await fetch("https://api.quran.com/api/v4/foot_notes/135063");
    console.log("Status for 135063:", res.status);
    const text = await res.text();
    console.log("Body for 135063:", text);

    const res1 = await fetch("https://api.quran.com/api/v4/foot_notes/135062");
    console.log("Status for 135062:", res1.status);
    const text1 = await res1.text();
    console.log("Body for 135062:", text1);
}
fetchFn();
