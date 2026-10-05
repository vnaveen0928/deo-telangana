/* ===========================================================================
   DEO Telangana - Office Management Suite
   Shared client-side application layer.

   No server. All records persist in the browser via localStorage under the
   key "deo_tg_v1". Use Backup / Restore (Settings) to move data between
   machines or to keep an off-line copy.
   =========================================================================== */

(function (global) {
  "use strict";

  const STORE_KEY = "deo_tg_v1";

  /* ---------- default / seed database ------------------------------------ */
  const SEED = {
    meta: {
      office: "O/o the District Educational Officer",
      district: "Ranga Reddy District",
      state: "Telangana",
      station: "Ranga Reddy",
      officer: "District Educational Officer",
      treasury: "DTO, Ranga Reddy",
      ddoCode: "2100XXXXX",
      createdOn: new Date().toISOString(),
    },
    /* running numbers for file / bill references */
    counters: {
      medicalNote: 40,
      mdmIndent: 12,
      billVoucher: 210,
      proceedings: 88,
      payBill: 55,
    },
    /* establishment - teachers & office staff master */
    employees: [
      {
        id: "E-1001", empNo: "1001", name: "K. Sridhar Rao",
        designation: "Secondary Grade Teacher", cadre: "SGT",
        school: "ZPHS Ibrahimpatnam", mandal: "Ibrahimpatnam",
        dob: "1985-06-12", doj: "2009-09-01", doa: "2009-09-01",
        pan: "ABCPS1234K", treasuryId: "12345678901", cpsNo: "CPS-556677",
        gpfNo: "", scale: "37100-91450", basic: 55410, gradePay: 0,
        hraPct: 12, cca: 0, group: "B", retirementDate: "2043-06-30",
        bank: "SBI", account: "620XXXXXX12", ifsc: "SBIN0020123",
        mobile: "9440000001", category: "OC", status: "Working",
      },
      {
        id: "E-1002", empNo: "1002", name: "M. Padmavathi",
        designation: "School Assistant (Maths)", cadre: "SA",
        school: "ZPHS Ibrahimpatnam", mandal: "Ibrahimpatnam",
        dob: "1982-02-20", doj: "2006-08-16", doa: "2006-08-16",
        pan: "ABCPP2233L", treasuryId: "12345678902", cpsNo: "",
        gpfNo: "EDN/45612", scale: "42300-100770", basic: 67340, gradePay: 0,
        hraPct: 12, cca: 0, group: "B", retirementDate: "2040-02-29",
        bank: "SBI", account: "620XXXXXX34", ifsc: "SBIN0020123",
        mobile: "9440000002", category: "BC-B", status: "Working",
      },
      {
        id: "E-1003", empNo: "1003", name: "G. Anil Kumar",
        designation: "Senior Assistant", cadre: "Ministerial",
        school: "O/o the DEO, Ranga Reddy", mandal: "Head Office",
        dob: "1979-11-05", doj: "2003-03-10", doa: "2011-06-01",
        pan: "ABCPA9988M", treasuryId: "12345678903", cpsNo: "",
        gpfNo: "EDN/33110", scale: "42300-100770", basic: 72710, gradePay: 0,
        hraPct: 24, cca: 0, group: "C", retirementDate: "2037-11-30",
        bank: "SBI", account: "620XXXXXX56", ifsc: "SBIN0020123",
        mobile: "9440000003", category: "OC", status: "Working",
      },
      {
        id: "E-1004", empNo: "1004", name: "S. Fatima Begum",
        designation: "Secondary Grade Teacher", cadre: "SGT",
        school: "MPPS Dandumailaram", mandal: "Kandukur",
        dob: "1990-04-18", doj: "2014-10-06", doa: "2014-10-06",
        pan: "ABCPF4455N", treasuryId: "12345678904", cpsNo: "CPS-778899",
        gpfNo: "", scale: "37100-91450", basic: 44870, gradePay: 0,
        hraPct: 12, cca: 0, group: "C", retirementDate: "2048-04-30",
        bank: "SBI", account: "620XXXXXX78", ifsc: "SBIN0020123",
        mobile: "9440000004", category: "Minority", status: "Working",
      },
    ],
    /* schools for MDM */
    schools: [
      { id: "S-01", udise: "36150100101", name: "MPPS Dandumailaram", mandal: "Kandukur", category: "Primary", enrol: 96, cook: "Smt. Lakshmi & Group" },
      { id: "S-02", udise: "36150100205", name: "MPUPS Mucherla", mandal: "Kandukur", category: "Upper Primary", enrol: 148, cook: "Smt. Radha SHG" },
      { id: "S-03", udise: "36150100310", name: "ZPHS Ibrahimpatnam", mandal: "Ibrahimpatnam", category: "High (VI-VIII MDM)", enrol: 212, cook: "Annapurna SHG" },
    ],
    medicalBills: [],
    mdmIndents: [],
    serviceMatters: [],
    payBills: [],
    bills: [],
    proceedings: [],
  };

  /* ---------- store helpers -------------------------------------------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) { save(SEED); return clone(SEED); }
      const db = JSON.parse(raw);
      /* forward-fill any missing top-level keys after upgrades */
      for (const k of Object.keys(SEED)) if (!(k in db)) db[k] = clone(SEED[k]);
      for (const k of Object.keys(SEED.counters)) if (!(k in db.counters)) db.counters[k] = SEED.counters[k];
      return db;
    } catch (e) {
      console.error("store load failed, reseeding", e);
      save(SEED);
      return clone(SEED);
    }
  }
  function save(db) { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  const DB = load();

  /* mutate + persist in one call */
  function commit(fn) {
    const r = fn(DB);
    save(DB);
    return r;
  }

  function nextCounter(name) {
    DB.counters[name] = (DB.counters[name] || 0) + 1;
    save(DB);
    return DB.counters[name];
  }

  function uid(prefix) {
    return (prefix || "ID") + "-" + Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2, 6);
  }

  /* ---------- formatting utilities ------------------------------------- */
  const MONTHS = ["January","February","March","April","May","June","July",
    "August","September","October","November","December"];

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d)) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
  }
  function fmtLongDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d)) return iso;
    return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function fyOf(iso) {
    const d = new Date((iso || today()) + "T00:00:00");
    const y = d.getFullYear(), m = d.getMonth();
    return m >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
  }

  function money(n) {
    n = Number(n || 0);
    const neg = n < 0; n = Math.abs(n);
    const s = n.toFixed(2);
    let [i, f] = s.split(".");
    let last3 = i.slice(-3), rest = i.slice(0, -3);
    if (rest) last3 = "," + last3;
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return (neg ? "-" : "") + "₹ " + rest + last3 + "." + f;
  }
  function num(n) { return Number(n || 0).toLocaleString("en-IN"); }

  /* amount in words - Indian system, up to crores, with paise */
  function amountInWords(amount) {
    amount = Number(amount || 0);
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
      "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen",
      "Eighteen","Nineteen"];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    function two(n){ return n < 20 ? a[n] : b[Math.floor(n/10)] + (n%10 ? " " + a[n%10] : ""); }
    function three(n){
      const h = Math.floor(n/100), r = n%100;
      return (h ? a[h] + " Hundred" + (r ? " and " : "") : "") + (r ? two(r) : "");
    }
    function inWords(n){
      if (n === 0) return "Zero";
      const crore = Math.floor(n/10000000); n %= 10000000;
      const lakh = Math.floor(n/100000); n %= 100000;
      const thou = Math.floor(n/1000); n %= 1000;
      const hun = n;
      let out = "";
      if (crore) out += three(crore) + " Crore ";
      if (lakh) out += three(lakh) + " Lakh ";
      if (thou) out += three(thou) + " Thousand ";
      if (hun) out += three(hun);
      return out.trim();
    }
    let words = "Rupees " + inWords(rupees);
    if (paise) words += " and " + inWords(paise) + " Paise";
    return words + " only";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- DOM helpers -------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k.startsWith("on") && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(c => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return n;
  }

  function toast(msg, kind) {
    let box = $("#toast");
    if (!box) { box = el("div", { id: "toast" }); document.body.appendChild(box); }
    const t = el("div", { class: "t " + (kind || ""), text: msg });
    box.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2600);
  }

  function confirmBox(msg) { return global.confirm(msg); }

  /* serialize a <form> into a plain object */
  function formData(form) {
    const o = {};
    $$("[name]", form).forEach(f => {
      if (f.type === "checkbox") o[f.name] = f.checked;
      else if (f.type === "number") o[f.name] = f.value === "" ? "" : Number(f.value);
      else o[f.name] = f.value.trim ? f.value.trim() : f.value;
    });
    return o;
  }

  /* ---------- shared chrome (masthead + nav + footer) --------------- */
  const NAV = [
    ["index.html", "Dashboard"],
    ["medical-bills.html", "Medical Reimbursement"],
    ["mid-day-meals.html", "Mid Day Meals"],
    ["service-matters.html", "Service Matters"],
    ["payslips.html", "Pay Slips"],
    ["bill-generation.html", "Bill Generation"],
    ["establishment.html", "Establishment"],
    ["settings.html", "Settings"],
  ];

  function chrome(activeFile) {
    const m = DB.meta;
    const head = el("header", { class: "masthead" }, []);
    head.innerHTML = `
      <div class="emblem">GoT</div>
      <div>
        <h1>${esc(m.office)}, ${esc(m.district)}</h1>
        <p>Government of ${esc(m.state)} &nbsp;&middot;&nbsp; School Education Department &nbsp;&middot;&nbsp; Office Management Suite</p>
      </div>
      <div class="spacer"></div>
      <div class="office-tag">DDO Code: ${esc(m.ddoCode)}</div>`;
    const nav = el("nav", { class: "topnav" },
      NAV.map(([href, label]) => el("a", {
        href, class: href === activeFile ? "active" : "", text: label,
      })));
    document.body.prepend(nav);
    document.body.prepend(head);

    const foot = el("footer", { class: "gov" });
    foot.innerHTML = `Office Management Suite &mdash; for internal use of ${esc(m.office)}, ${esc(m.district)}. ` +
      `Data is stored only in this browser. Take regular backups from the Settings page. ` +
      `Document formats follow A.P./Telangana Financial Code, T.S. Medical Attendance Rules 1972 and MDM guidelines and must be verified by the dealing section before dispatch.`;
    document.body.appendChild(foot);
  }

  /* ---------- CSV export ------------------------------------------- */
  function toCSV(rows) {
    return rows.map(r => r.map(c => {
      c = c == null ? "" : String(c);
      return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
    }).join(",")).join("\r\n");
  }
  function downloadFile(name, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- pay computation (used by payslips + pay bill) -------- */
  /* Simplified Telangana RPS-2020 style computation. DA %, PT slabs and
     other rates are editable in Settings so the office can keep them current. */
  const RATES_DEFAULT = {
    daPct: 22.75,          // Dearness Allowance % of basic
    hraSlabs: { "24": 24, "17": 17, "12": 12, "8": 8 },
    ptSlabs: [             // monthly professional tax
      { upto: 15000, tax: 0 },
      { upto: 20000, tax: 150 },
      { upto: Infinity, tax: 200 },
    ],
    cpsEmpPct: 10,         // CPS/NPS employee share % of (basic+DA)
    gisMonthly: 90,        // Group Insurance Scheme
    apgliDefault: 0,
  };
  function rates() {
    return Object.assign({}, RATES_DEFAULT, DB.meta.rates || {});
  }
  function professionalTax(grossMonthly) {
    const r = rates();
    for (const s of r.ptSlabs) if (grossMonthly <= s.upto) return s.tax;
    return 200;
  }
  function computePay(emp, opts) {
    opts = opts || {};
    const r = rates();
    const basic = Number(opts.basic != null ? opts.basic : emp.basic) || 0;
    const daPct = opts.daPct != null ? opts.daPct : r.daPct;
    const hraPct = opts.hraPct != null ? opts.hraPct : (emp.hraPct || 0);
    const da = Math.round(basic * daPct / 100);
    const hra = Math.round(basic * hraPct / 100);
    const cca = Number(opts.cca != null ? opts.cca : emp.cca) || 0;
    const otherEarn = Number(opts.otherEarn || 0);
    const gross = basic + da + hra + cca + otherEarn;

    const isCPS = !!(emp.cpsNo || emp.cpsNo === "" && emp.gpfNo === "" ) && !emp.gpfNo;
    const cps = (emp.cpsNo && !emp.gpfNo) ? Math.round((basic + da) * r.cpsEmpPct / 100) : 0;
    const gpf = Number(opts.gpf || 0);
    const pt = opts.pt != null ? opts.pt : professionalTax(gross);
    const gis = opts.gis != null ? opts.gis : r.gisMonthly;
    const apgli = Number(opts.apgli != null ? opts.apgli : (emp.apgli || r.apgliDefault)) || 0;
    const it = Number(opts.incomeTax || 0);
    const otherDed = Number(opts.otherDed || 0);
    const totalDed = cps + gpf + pt + gis + apgli + it + otherDed;

    return {
      basic, daPct, da, hraPct, hra, cca, otherEarn, gross,
      cps, gpf, pt, gis, apgli, it, otherDed, totalDed,
      net: gross - totalDed,
      scheme: (emp.cpsNo && !emp.gpfNo) ? "CPS/NPS" : "GPF",
    };
  }

  /* ---------- public API ----------------------------------------- */
  const App = {
    STORE_KEY, DB, SEED,
    load, save, commit, clone, nextCounter, uid,
    fmtDate, fmtLongDate, fmtLongDateISO: fmtLongDate, today, fyOf, MONTHS,
    money, num, amountInWords, esc,
    $, $$, el, toast, confirmBox, formData, chrome,
    toCSV, downloadFile,
    rates, RATES_DEFAULT, professionalTax, computePay,
    resetAll() {
      if (!confirmBox("This will erase ALL office data in this browser and restore the sample records. Continue?")) return;
      localStorage.removeItem(STORE_KEY);
      location.reload();
    },
    exportBackup() {
      const name = `DEO-backup-${today()}.json`;
      downloadFile(name, JSON.stringify(DB, null, 2), "application/json");
      toast("Backup file created", "ok");
    },
    importBackup(file, done) {
      const fr = new FileReader();
      fr.onload = () => {
        try {
          const obj = JSON.parse(fr.result);
          if (!obj || typeof obj !== "object" || !("employees" in obj)) throw new Error("Not a valid backup");
          localStorage.setItem(STORE_KEY, JSON.stringify(obj));
          toast("Backup restored. Reloading…", "ok");
          setTimeout(() => location.reload(), 800);
        } catch (e) {
          toast("Could not restore: " + e.message, "err");
          done && done(e);
        }
      };
      fr.readAsText(file);
    },
  };

  global.App = App;
})(window);
