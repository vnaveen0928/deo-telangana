# District Educational Office (Telangana) — Office Management Suite

A self‑contained website for running the day‑to‑day paperwork of a District
Educational Office. It runs entirely in the browser — **no server, no
database, no internet** — and stores every record in the browser's
`localStorage`. Open `index.html` and use it.

---

## What it covers

| Section | File | Produces |
|---|---|---|
| **Dashboard** | `index.html` | KPIs, recent activity, pending‑action list |
| **Medical Reimbursement** | `medical-bills.html` | Claim register + **Note (file noting)** and **Draft (sanction Proceedings)** for every claim, under T.S. Medical Attendance Rules 1972 |
| **Mid Day Meals (PM POSHAN)** | `mid-day-meals.html` | School‑wise monthly **indent**, **cooking‑cost & CCH‑honorarium bill**, **rice account**, **Utilisation Certificate** |
| **Service Matters** | `service-matters.html` | Note + **Proceedings** for increments, AAS, promotion, transfer, leave, pay fixation, surrender leave, pension/retirement, charge memo, etc. — with auto‑drafted order text per matter type |
| **Pay Slips** | `payslips.html` | Monthly individual pay slip (RPS‑2020 style earnings & recoveries, LOP, arrears) |
| **Bill Generation** | `bill-generation.html` | **Establishment Pay Bill** with inner sheet, abstract and CPS/GPF/PT/GIS/APGLI/IT **schedules**; **contingent / T.A. / medical / MDM / other bills** in treasury format with voucher no., pass order and amount in words |
| **Establishment** | `establishment.html` | Master data of teaching & ministerial staff (service, pay scale, treasury, bank) |
| **Settings** | `settings.html` | Office particulars on every document; DA %, PT slabs, CPS %, GIS, MDM rates; **Backup / Restore / Reset** |

Medical claims and MDM indents can be pushed to **Bill Generation** with one
click ("Send to Bill Generation").

---

## Running it

**Option A — just open the file.** Double‑click `index.html`. Everything
works from `file://`.

**Option B — serve it (recommended, avoids browser file‑path quirks):**

```bash
cd deo-telangana
python3 -m http.server 8777
```

then open <http://localhost:8777>.

**Option C — host it.** Copy the `deo-telangana/` folder to any static web
host or an internal IIS/Apache share. There is nothing to build.

---

## Data, backup & safety

* All records live **only in the browser profile** you use. Another computer,
  another browser, or "clear browsing data" will not have them.
* **Settings → Download backup (.json)** saves everything to one file.
  **Restore from backup** loads it on another machine.
* **Settings → Erase all & restore sample data** wipes and reseeds.
* Export buttons on each register produce **CSV** for Excel.
* Every document has **Print / PDF** (uses the browser's print dialog;
  choose "Save as PDF"). Print styling is in `assets/print.css` (A4, margins,
  chrome hidden).

---

## Important — verify before use

The rates and G.O. citations shipped here are **indicative defaults** so the
forms are usable out of the box:

* DA %, PT slabs, CPS %, GIS, and MDM cooking‑cost / rice / honorarium rates
  are set in **Settings** — update them to the figures **currently notified
  by the Government of Telangana / Finance Department**.
* The G.O. and rule references pre‑filled in Medical and Service‑Matter
  drafts are examples of the *type* of authority to cite. **The dealing
  section must check every Note, Draft, Proceedings, pay slip and bill
  against the current code, G.O.s and the Service Register before the
  document is signed or dispatched.**

This suite prepares office paperwork; it does not replace treasury software
(CFMS/IFMIS), UDISE+, the MDM‑MIS portal or the Employee/Pensioner databases.

---

## Files

```
deo-telangana/
├── index.html              Dashboard
├── medical-bills.html      Medical reimbursement — Note & Draft
├── mid-day-meals.html      MDM indents, bills, UC
├── service-matters.html    Increments / promotions / transfers / leave / pension …
├── payslips.html           Individual monthly pay slip
├── bill-generation.html    Pay bills + contingent/other bills, schedules
├── establishment.html      Staff master
├── settings.html           Office particulars, rates, backup
├── README.md
└── assets/
    ├── app.js              Shared store, pay computation, helpers, chrome
    ├── styles.css          UI + official‑document styling
    └── print.css           Print / PDF rules
```
