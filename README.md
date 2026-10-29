# TaskTrack — Mini-Project 2 (Software Testing)

A small browser-based task manager with automated Selenium regression tests, an exploratory test charter, bug taxonomy, and test-report templates.

## 1. System environment

- OS: Windows 10/11, Linux, or macOS
- Browser: Google Chrome / Chromium
- Language: HTML5, CSS3, JavaScript (ES6)
- Test tool: Selenium WebDriver 4 + Python unittest
- Storage: browser localStorage (no server or database required)
- IDE: VS Code or PyCharm

## 2. Run the application

Open `app/index.html` in Chrome. Tasks are stored in that browser profile using localStorage.

For a local HTTP server (recommended for a more realistic test setup), run from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/app/`.

## 3. Run automated regression tests

Install Python 3.10+ and Chrome. Recent Selenium versions can use Selenium Manager to locate/download a compatible driver automatically.

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
python -m unittest discover -s tests -v
```

To test against a running local HTTP server instead of a file URL:

**Windows PowerShell**
```powershell
$env:TASKTRACK_URL="http://localhost:8000/app/"
python -m unittest discover -s tests -v
```

**macOS/Linux**
```bash
TASKTRACK_URL=http://localhost:8000/app/ python -m unittest discover -s tests -v
```

Headless mode is enabled by default. Set `HEADLESS=0` to see Chrome.

## 4. Test plan (concise)

**Objective:** Verify task creation, validation, task metadata, search, filters, completion, deletion, counters, and persistence. Confirm that changes do not break previously working features.

**Scope:** Functional UI and browser-local persistence. Excludes authentication, server APIs, multi-user behavior, security penetration tests, and cross-device sync.

**Entry criteria:** App files available; Chrome and Python installed; Selenium dependencies installed.

**Exit criteria:** All critical regression tests pass; no open Severity-1 or Severity-2 defects; exploratory findings recorded with reproduction steps.

**Test data:** Valid task title, blank title, whitespace-padded title, 100/101-character titles, High/Medium/Low priorities, optional date, mixed-case search, active/completed tasks.

### Feature coverage

| ID | Feature | Expected result |
|---|---|---|
| TC-01 | Initial load | Empty state and zero counters are visible |
| TC-02 | Blank title | Task is not created; validation message appears |
| TC-03 | Add valid task | Task appears and total count increments |
| TC-04 | Trim spaces | Leading/trailing spaces are removed |
| TC-05 | Priority | Selected priority badge is displayed |
| TC-06 | Due date | Optional due date is displayed in DD/MM/YYYY |
| TC-07 | Search | Case-insensitive title filtering works |
| TC-08 | Status filter | All/Active/Completed filters show matching tasks |
| TC-09 | Complete task | Checkbox/style/counter update correctly |
| TC-10 | Delete task | Task is removed and counters update |
| TC-11 | Persistence | Tasks remain after refresh in same browser |
| TC-12 | Responsive layout | Form and list remain usable at desktop/mobile widths |

## 5. Bug taxonomy

Classify every defect by type, severity, and priority.

- **Functional:** add, delete, complete, filter or search behaves incorrectly.
- **Validation/data:** blank/overlong titles accepted, malformed data, incorrect date.
- **UI/usability:** clipped text, inaccessible controls, broken responsive layout.
- **Compatibility:** behavior differs between supported browsers/OS.
- **Performance:** slow rendering or freezing with many tasks.
- **Persistence/reliability:** localStorage fails, loses data, or corrupted JSON crashes the app.
- **Accessibility:** missing labels, keyboard navigation or screen-reader issues.

**Severity:** S1 Critical (app unusable/data loss); S2 High (major feature broken); S3 Medium (workaround exists); S4 Low (cosmetic/minor inconvenience).

**Priority:** P1 fix immediately; P2 fix in current cycle; P3 schedule later. Severity is impact; priority is urgency.

## 6. Regression script order

Run in this order after every code change:

1. TC-01 app load and empty state
2. TC-02 blank-title validation
3. TC-03 create task and priority
4. TC-04 whitespace trimming
5. TC-05 search
6. TC-06 active/completed filtering
7. TC-07 delete task
8. TC-08 persistence after refresh
9. TC-09 due-date display
10. TC-10 completed counter

The automated suite is in `tests/test_tasktrack.py`. Each test resets localStorage before execution.

## 7. Selenium IDE alternative

1. Install the **Selenium IDE** browser extension.
2. Create a project named `TaskTrack Regression`.
3. Set base URL to `http://localhost:8000/app/` (start the HTTP server first).
4. Record or add commands for: open app → verify empty state → enter title → click Add task → assert task title → click checkbox → assert completed counter → delete task → assert empty state.
5. Save the project as `tests/tasktrack.side`.
6. Use Selenium IDE's run button to execute the suite and export/save the run result. Selenium IDE is separate from the Python WebDriver suite.

## 8. Exploratory testing charter

**Mission:** Find defects outside the scripted happy path in 15–20 minutes.

Try:
- Submit empty, spaces-only, 100-character and 101-character titles.
- Search with mixed case, spaces, punctuation, and no-match terms.
- Add tasks with each priority and with/without a due date.
- Complete then un-complete a task; apply filters while searching.
- Delete the final task; refresh after add/delete/complete.
- Resize viewport to 375 px; use keyboard Tab/Enter/Space.
- Reload with malformed localStorage data; test with browser storage disabled/full if possible.
- Try many tasks (100+) and inspect responsiveness and console errors.

Record each finding as: ID, build, preconditions, exact steps, expected, actual, screenshot/console evidence, severity, priority, status, retest result. Do not report a suspected issue as confirmed until reproduced.

## 9. Test report template

**Execution date/build:** __________  
**Browser/OS:** __________  
**Tester:** __________  
**Automated tests:** Pass ___ / Fail ___ / Blocked ___  
**Exploratory tests performed:** __________  
**Defects opened:** __________  
**Known limitations:** localStorage is browser/profile-specific; this demo has no login or server-side database.

| Defect ID | Summary | Steps to reproduce | Expected | Actual | Severity | Priority | Status |
|---|---|---|---|---|---|---|---|
| BUG-001 | Fill after discovery | 1. … 2. … | … | … | S1–S4 | P1–P3 | Open/Fixed |

**Important:** Do not claim Selenium found bugs until you run the suite and record real observations. This project provides automated checks and an exploratory report template; test execution results depend on your machine/browser.
