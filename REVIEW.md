# Code Review: Administrative-divisions-of-China

This document contains a thorough review of the repository's architecture, security, reliability, test coverage, and performance.

Findings are categorized by severity: **CRITICAL**, **HIGH**, **MEDIUM**, and **LOW**.

---

## HIGH

### 1. Infinite Recursion on Network Failures
* **File:** `lib/crawler.js` (Lines 80, 93, 107, 122, 137)
* **Impact:** If the target server (`www.stats.gov.cn`) consistently returns a non-200 status code, fails to respond, or returns an error other than `timeout`, the `catch` blocks recursively call their respective fetch functions without any limits. This can cause the process to spin indefinitely, eventually leading to a `RangeError: Maximum call stack size exceeded` or an infinite loop that locks up the execution thread.
* **Fix Suggestion:** Introduce a maximum retry limit (e.g., 3 or 5 attempts). If the limit is exceeded, throw the error or reject the promise so the upstream worker can handle it appropriately.

### 2. Massive `NOT IN` Queries Causing Excessive Memory and DB Strain
* **File:** `lib/worker.js` (Lines 35, 73, 119, 169)
* **Impact:** The worker identifies which areas need to be scraped by fetching all existing codes from the database into a JavaScript array using `aggregate('...Code', 'DISTINCT')`, and then querying with `Sequelize.Op.notIn`. For the `Village` level, this loads tens of thousands of `streetCode` values into application memory and creates an exceptionally long SQL query. This scale will severely degrade performance and could exceed SQLite's max query length limit.
* **Fix Suggestion:** Replace the Javascript-memory-based exclusion with SQL native capabilities. Use a `LEFT JOIN` (where the joined table's ID is NULL) or a `NOT EXISTS` subquery directly in Sequelize, allowing the database engine to handle the diffing logic.

---

## MEDIUM

### 3. Missing HTTPS for Data Scraping
* **File:** `lib/crawler.js` (Line 19)
* **Impact:** Data is scraped over plaintext `http://` instead of `https://`. While this is public data, scraping over HTTP makes the connection vulnerable to Man-in-the-Middle (MITM) attacks, meaning an attacker could intercept and inject corrupted or malicious geographical data payloads into the resulting dataset.
* **Fix Suggestion:** Update the script to use Node's `https` module and change the target host URL to use `https://`. (Note: The National Bureau of Statistics website now supports HTTPS).

### 4. Excessive Memory Usage in AWK JSON Export
* **File:** `export_json.sh`
* **Impact:** The script uses `awk` to convert SQLite output to JSON. It stores every single row in `awk` associative arrays (e.g., `code[++i]=$1; name[i]=$2`) and loops through them at the `END` block to print the JSON array. For the `village` data (which contains over 600,000 records), this requires massive amounts of RAM and will perform poorly on low-resource machines.
* **Fix Suggestion:** Refactor the `awk` script to stream the output. Print the JSON objects line-by-line within the main execution block (maintaining a boolean flag or record count for commas) rather than buffering the entire dataset into memory.

### 5. Abrupt Process Exit Deep in Library Code
* **File:** `lib/crawler.js` (Line 62)
* **Impact:** When the scraper detects an anti-bot or JS challenge ("请开启JavaScript并刷新该页"), it invokes `process.exit(0)`. This completely shuts down the Node process gracefully (`0` status code), stripping the caller (`worker.js` or `export.js`) of the ability to handle the error, run cleanup tasks, or notify monitoring systems of failure.
* **Fix Suggestion:** Remove `process.exit(0)` and instead `reject(new Error('Rate limited / JS Challenge detected'))`. Handle process termination at the topmost entry point (e.g., `fetch.js`).

### 6. Missing Unit Tests for Scraper and Builder Logic
* **File:** `test/json.js`
* **Impact:** The repository only contains tests for the compiled static `.json` artifacts, serving more as integrity checks. There are no unit tests for the core logic in `crawler.js`, `format.js`, or `worker.js`. Any regressions in HTML parsing, data formatting, or database schema will only be detected by running a multi-hour scrape to see if the output matches expectations.
* **Fix Suggestion:** Add unit tests utilizing HTTP mocking libraries (e.g., `nock`) for `crawler.js` and an in-memory SQLite database for `worker.js` to enable fast, offline testing of the core business logic.

---

## LOW

### 7. Missing Package Lockfile
* **File:** Repository Root
* **Impact:** There is no `package-lock.json` or `yarn.lock` present. Consequently, dependency versions are not strictly pinned, which can result in the "works on my machine" phenomenon. It also exposes users to unpredictable bugs or supply-chain vulnerabilities when unpinned sub-dependencies update.
* **Fix Suggestion:** Run `npm install` to generate a `package-lock.json` and commit it to the repository.

### 8. Fragile String Manipulation for JSON Escaping
* **File:** `export_json.sh`
* **Impact:** The script generates JSON by concatenating strings using `|` as a quote placeholder, and then applying `tr '|' '"'`. If any province, city, area, street, or village name naturally contained a `|` character or a `"` quote, this naive escaping would produce invalid JSON.
* **Fix Suggestion:** Use `sqlite3 -json` natively (available in modern SQLite versions) or a robust command-line JSON processor like `jq` to serialize strings safely.
