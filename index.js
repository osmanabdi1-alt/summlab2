const form = document.getElementById("searchForm");
const input = document.getElementById("wordInput");
const result = document.getElementById("result");
const loading = document.getElementById("loading");
const historyList = document.getElementById("historyList");

const searchHistory = [];

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const word = input.value.trim();

    if (!word) {
        showError("Please enter a word.");
        return;
    }

    fetchWord(word);
});

async function fetchWord(word) {

    loading.classList.remove("hidden");
    result.innerHTML = "";

    try {

        const response =
        await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );

        if (!response.ok) {
            throw new Error("Word not found");
        }

        const data = await response.json();

        displayWord(data[0]);

        addToHistory(word);

    } catch (error) {

        showError(
            "Word not found. Please try another search."
        );

    } finally {

        loading.classList.add("hidden");
    }
}

function displayWord(entry) {

    let meaningsHTML = "";
    let synonymsHTML = "";
    let audioUrl = "";

    const phonetic =
        entry.phonetic ||
        "No phonetic spelling available";

    const audioObj =
        entry.phonetics.find(
            item => item.audio
        );

    if (audioObj) {
        audioUrl = audioObj.audio;
    }

    entry.meanings.forEach(meaning => {

        const definition =
            meaning.definitions[0];

        meaningsHTML += `
            <div class="section">
                <h3>${meaning.partOfSpeech}</h3>
                <p>${definition.definition}</p>
                <br>
                <em>
                    ${definition.example || ""}
                </em>
            </div>
        `;

        if (meaning.synonyms.length > 0) {

            synonymsHTML +=
            meaning.synonyms
            .slice(0,5)
            .join(", ");
        }
    });

    result.innerHTML = `
        <div class="word-card">

            <h2>${entry.word}</h2>

            <p class="phonetic">
                ${phonetic}
            </p>

            ${
                audioUrl
                ?
                `<button
                    class="audio-btn"
                    id="playAudio">
                    🔊 Pronounce
                </button>`
                :
                ""
            }

            ${meaningsHTML}

            <div class="section">
                <h3>Synonyms</h3>
                <p>
                    ${
                        synonymsHTML ||
                        "No synonyms available"
                    }
                </p>
            </div>

        </div>
    `;

    if (audioUrl) {

        document
        .getElementById("playAudio")
        .addEventListener("click", () => {

            const audio =
            new Audio(audioUrl);

            audio.play();
        });
    }
}

function addToHistory(word) {

    if (
        searchHistory.includes(word)
    ) {
        return;
    }

    searchHistory.unshift(word);

    if (
        searchHistory.length > 8
    ) {
        searchHistory.pop();
    }

    renderHistory();
}

function renderHistory() {

    historyList.innerHTML = "";

    searchHistory.forEach(word => {

        const li =
        document.createElement("li");

        li.textContent = word;

        li.addEventListener(
            "click",
            () => fetchWord(word)
        );

        historyList.appendChild(li);
    });
}

function showError(message) {

    result.innerHTML = `
        <div class="error">
            ${message}
        </div>
    `;
}