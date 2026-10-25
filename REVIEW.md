# Code Review: Administrative-divisions-of-China

This document contains a thorough review of the repository's architecture, security, reliability, test coverage, and performance.

Findings are categorized by severity: **CRITICAL**, **HIGH**, **MEDIUM**, and **LOW**.

---

## HIGH

### 1. Infinite Livelock on Network Failures
* **File:** `lib/crawler.js` (Lines 84, 98, 115, 134, 154)
* **Impact:** If the target server (`www.stats.gov.cn`) consistently returns a non-200 status code, fails to respond, or returns an error (including `timeout`), the `catch` blocks recursively call their respective fetch functions without any backoff or retry limits. This creates an asynchronous livelock that spins indefinitely without throwing a stack overflow (due to async execution), effectively hanging the process.
* **Fix Suggestion:** Introduce a maximum retry limit (e.g., 3 attempts) and/or exponential backoff. If the limit is exceeded, throw the error or reject the promise so the upstream worker can handle it appropriately.

### 2. Massive `NOT IN` Query Causing Excessive Memory and DB Strain
* **File:** `lib/worker.js` (Lines 192-193)
* **Impact:** The worker identifies which village areas need to be scraped by fetching all existing `streetCode` values from the `Village` table into a JavaScript array (over 41,352 codes), and then querying with `Sequelize.Op.notIn`. This loads tens of thousands of values into application memory and creates an exceptionally long SQL query. This scale severely degrades performance.
* **Fix Suggestion:** Replace the Javascript-memory-based exclusion with a SQL native subquery directly in Sequelize (e.g., `Sequelize.literal('(SELECT DISTINCT streetCode FROM village)')`), allowing the database engine to handle the diffing logic efficiently.

### 3. Data Source Discontinued / Hardcoded Path 2023
* **File:** `README.md`, `lib/crawler.js`
* **Impact:** As noted in the README, the National Bureau of Statistics stopped making the specific code data publicly available in October 2024. The crawler hardcodes the year 2023 in its path, meaning it cannot fetch new data in the future.
* **Fix Suggestion:** The repository should clearly state its archival status (which is already mostly documented) and the crawler could optionally be parameterised, though live scraping is no longer possible for newer years.

### 4. Uncaught Exception in `zlib.gunzipSync`
* **File:** `lib/crawler.js` (Line 56)
* **Impact:** The `end` event listener performs synchronous decompression using `zlib.gunzipSync(bufferHelper.toBuffer())`. If the response body is malformed or corrupted, this throws an exception that is not caught. Because it occurs inside an event callback, it will bubble up as an unhandled exception and crash the Node process outright.
* **Fix Suggestion:** Wrap the `zlib.gunzipSync` call in a `try/catch` block and explicitly `reject(err)` on failure.

---

## MEDIUM

### 5. Excessive Memory Usage in AWK JSON Export
* **File:** `export_json.sh`
* **Impact:** The script uses `awk` to convert SQLite output to JSON. It stores every single row in `awk` associative arrays (e.g., `code[++i]=$1; name[i]=$2`) and loops through them at the `END` block to print the JSON array. For the `village` data (which contains 620,573 records), this requires massive amounts of RAM.
* **Fix Suggestion:** Refactor the `awk` script to stream the output. Print the JSON objects line-by-line within the main execution block (maintaining a boolean flag for commas) rather than buffering the entire dataset into memory.

### 6. Abrupt Process Exit Deep in Library Code
* **File:** `lib/crawler.js` (Line 66)
* **Impact:** When the scraper detects an anti-bot or JS challenge ("请开启JavaScript并刷新该页"), it invokes `process.exit(0)`. This completely shuts down the Node process gracefully (`0` status code), stripping the caller (`worker.js` or `export.js`) of the ability to handle the error, run cleanup tasks, or notify monitoring systems of failure.
* **Fix Suggestion:** Remove `process.exit(0)` and instead `reject(new Error('Rate limited / JS Challenge detected'))`. Handle process termination at the topmost entry point.

### 7. Incorrect Comment for Zhongshan City Code
* **File:** `lib/worker.js` (Lines 100, 115, 166, 220)
* **Impact:** The comments frequently refer to Zhongshan city as code `3320`. However, the actual code for Zhongshan in the implementation and standard is `4420`. This discrepancy can cause confusion for maintainers.
* **Fix Suggestion:** Correct the comments to state `4420`.

### 8. Missing User-Agent Header
* **File:** `lib/crawler.js` (Line 31)
* **Impact:** The crawler makes HTTP requests using the default Node.js HTTP client without specifying a `User-Agent`. This makes the scraper easily identifiable and is likely the direct cause of the JS challenges/anti-bot protection being triggered.
* **Fix Suggestion:** Add a standard browser `User-Agent` string to the HTTP request headers.

### 9. Missing HTTPS for Data Scraping
* **File:** `lib/crawler.js` (Line 1, Line 31)
* **Impact:** Data is scraped over plaintext `http://` instead of `https://`. While this is public frozen data, scraping over HTTP makes the connection vulnerable to Man-in-the-Middle (MITM) attacks.
* **Fix Suggestion:** Update the script to require the `https` module instead of `http`. Note: as the data is frozen, this is less critical than it would be for a live, active data feed.

### 10. Missing Unit Tests for Scraper and Builder Logic
* **File:** `test/json.js`
* **Impact:** The repository only contains tests for the compiled static `.json` artifacts. There is also a typo in the tests (`t[0].anem` instead of `t[0].name`). There are no unit tests for the core logic in `crawler.js`, `format.js`, or `worker.js`.
* **Fix Suggestion:** Fix the typo and add unit tests utilizing HTTP mocking libraries for `crawler.js` and an in-memory SQLite database for `worker.js` to enable offline testing.

---

## LOW

### 11. Fragile String Manipulation for JSON Escaping
* **File:** `export_json.sh`
* **Impact:** The script generates JSON by concatenating strings using `|` as a quote placeholder, and then applying `tr '|' '"'`. While there are currently 0 records in the dataset containing `|` or `"`, this naive escaping is potentially fragile if the data source ever introduces those characters.
* **Fix Suggestion:** Use `sqlite3 -json` natively (available in modern SQLite versions) or a robust command-line JSON processor like `jq` to serialize strings safely.

### 12. License Mismatch
* **File:** `package.json`, `LICENSE`, `README.md`
* **Impact:** The `package.json` lists the license as `MIT`, but the repository contains a `LICENSE` file and a `README.md` badge specifying the `WTFPL` (Do What The F*ck You Want To Public License). This creates legal ambiguity for consumers of the package.
* **Fix Suggestion:** Update the `license` field in `package.json` to `WTFPL`.
