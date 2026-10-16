IT 110 MIDTERM PROJECT - LEXI DICTIONARY APP
Caraga State University, College of Computing and Information Sciences

GROUP NAME
Team Lexi

MEMBERS:
- CLYDE   - HTML structure and portfolio page
- BUCONG   - CSS styling and layout
- LLOYD - JavaScript and API integration

PROJECT DESCRIPTION
A single-page dictionary application. The user types an English word and the
app shows its phonetic spelling, audio pronunciation, definitions, example
sentences, and synonyms.

API USED
Free Dictionary API
Documentation: https://en.wiktionary.org
Endpoint: https://en.wiktionary.org/api/rest_v1/page/definition/<word>
No API key is required.

FILES
- index.html : portfolio homepage (team, project, link to the app)
- app.html   : the dictionary application page
- styles.css : styles shared by both pages
- script.js  : JavaScript (fetch with async/await, error handling, DOM updates)
- images/    : team photos

FEATURES
- Search by button or Enter key
- Input validation (empty input, numbers, spaces)
- Loading message while fetching
- Friendly error messages (word not found, no internet, request failed)
- Audio pronunciation button
- Multiple parts of speech, example sentences, and synonyms
- Responsive layout for phones and desktops