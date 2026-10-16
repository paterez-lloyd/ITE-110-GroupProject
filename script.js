/*
   LEXI - Dictionary App | script.js
   API: Wiktionary REST API
        https://en.wiktionary.org/api/rest_v1/
   Flow: user submits word -> validate -> fetch -> parse JSON
         -> build DOM -> show result (or a friendly error)
   */

/* ---------- 1. ELEMENTS we need in app.html ---------- */
const form = document.getElementById("search-form");
const input = document.getElementById("word-input");
const button = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const resultContainer = document.getElementById("result-container");

const API_URL = "https://en.wiktionary.org/api/rest_v1/page/definition/";

/* ---------- 2. Small helper functions ---------- */

// Show a message in the status box. isError = true makes it red.
function showStatus(message, isError = false) {
  statusEl.hidden = false;  //If there's an error, show the box with error message
  statusEl.className = isError ? "message error" : "message";
  statusEl.textContent = message;
}

function hideStatus() {   //Hides the box if no error.
  statusEl.hidden = true;
}

// Create an element with an optional class and text.
// We use textContent (not innerHTML) so API data can never inject HTML.
function createEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className; //If className == null, undefine, or "" skip this line.
  if (text) element.textContent = text; //Woks the same way as className.
  return element;
}

// Wiktionary sends definitions as small pieces of HTML
// plain text so we can show them safely.
function stripHtml(html) {                //If html is empty, execute "".
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return (doc.body.textContent || "").trim();
}

// Say the word aloud using the browser's built-in speech feature.
function speakWord(word) {
  if (!("speechSynthesis" in window)) {
    showStatus("Your browser does not support spoken pronunciation.", true);
    return;
  }
  window.speechSynthesis.cancel(); // stop anything already speaking
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

/* ---------- 3. Fetch data from the API ---------- */
async function fetchDefinition(word) {
  showStatus("Searching...");
  resultContainer.innerHTML = "";
  button.disabled = true; // stop double-clicks while loading

  try {
    // Wiktionary page titles are case-sensitive, so use lowercase.
    // encodeURIComponent keeps special characters safe inside a URL.
    const response = await fetch(API_URL + encodeURIComponent(word.toLowerCase()));

    // fetch only throws on network failure, so we check the status ourselves
    if (response.status === 404) {
      showStatus(`No results found for "${word}". Check the spelling and try again.`, true);
      return;
    }
    if (!response.ok) {
      throw new Error("Server responded with status " + response.status);
    }

    const data = await response.json(); // parse the JSON body

    // The JSON is grouped by language code. We only want English ("en").
    const entries = data.en || [];
    if (entries.length === 0) {
      showStatus(`No English definition found for "${word}".`, true);
      return;
    }

    hideStatus();
    displayResult(word, entries);
  } catch (error) {
    // Reached when there is no internet or the request fails
    console.error("Lexi error:", error.name, "-", error.message);
    showStatus("Could not fetch data. Please try again.", true);
  } finally {
    button.disabled = false; // always re-enable the button
  }
}

/* ---------- 4. Show the result on the page (DOM update) ---------- */
function displayResult(word, entries) {
  const article = createEl("article", "entry");
  article.appendChild(createEl("h2", "entry-word", word.toLowerCase()));

  // Pronunciation button (uses the browser's speech feature)
  const speakLine = createEl("p", "entry-phonetic");
  const speakBtn = createEl("button", "audio-btn", "Hear pronunciation");
  speakBtn.type = "button";
  speakBtn.style.marginLeft = "0";
  speakBtn.addEventListener("click", function () {
    speakWord(word);
  });
  speakLine.appendChild(speakBtn);
  article.appendChild(speakLine);

  // One block per part of speech (noun, verb, ...)
  for (const entry of entries) {
    const definitions = entry.definitions || [];
    const list = createEl("ol", "definitions");

    for (const def of definitions) {
      const text = stripHtml(def.definition);
      if (text === "") continue; // skip empty definitions
      if (list.children.length === 3) break; // max 3 per part of speech

      const item = createEl("li", "", text);
      const examples = def.examples || [];
      if (examples.length > 0) {
        const exampleText = stripHtml(examples[0]);
        if (exampleText !== "") {
          item.appendChild(createEl("span", "example", `"${exampleText}"`));
        }
      }
      list.appendChild(item);
    }

    // Only show this part of speech if it has at least one definition
    if (list.children.length > 0) {
      article.appendChild(
        createEl("h3", "part-of-speech", (entry.partOfSpeech || "").toLowerCase())
      );
      article.appendChild(list);
    }
  }

  resultContainer.appendChild(article);
}

/* ---------- 5. Handle the form (button click AND Enter key) ---------- */
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const word = input.value.trim();

  // Input validation
  if (word === "") {
    resultContainer.innerHTML = "";
    showStatus("Please enter a word.", true);
    return;
  }
  if (!/^[A-Za-z'-]+$/.test(word)) {
    resultContainer.innerHTML = "";
    showStatus("Use letters only, with no numbers or spaces.", true);
    return;
  }

  fetchDefinition(word);
});
