const vote = {
    "JavaScript": 0,
    "Python": 0,
    "Java": 0
};

function updatevote() {
    document.getElementById("js").innerHTML = "JavaScript: " + vote["JavaScript"];
    document.getElementById("py").innerHTML = "Python: " + vote["Python"];
    document.getElementById("java").innerHTML = "Java: " + vote["Java"];
}

function Vote(language) {
    if (vote.hasOwnProperty(language)) {
        vote[language]++;
        updatevote();
    }
}

setInterval(() => {
    const langs = Object.keys(vote);
    const randomLang = langs[Math.floor(Math.random() * langs.length)];
    vote[randomLang]++;
    updatevote();
}, 2000);

window.onload = updatevote;