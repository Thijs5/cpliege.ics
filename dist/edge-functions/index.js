var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// netlify/edge-functions/index.ts
var edge_functions_exports = {};
__export(edge_functions_exports, {
  default: () => edge_functions_default
});
module.exports = __toCommonJS(edge_functions_exports);
var import_mod = require("https://deno.land/x/hono@v4.3.11/mod.ts");
var import_netlify = require("https://deno.land/x/hono@v4.3.11/adapter/netlify/index.ts");
var import_deno_dom_wasm = require("https://deno.land/x/deno_dom/deno-dom-wasm.ts");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var escapeRe = /[&<>'"]/;
var stringBufferToString = async (buffer, callbacks) => {
  let str = "";
  callbacks || (callbacks = []);
  const resolvedBuffer = await Promise.all(buffer);
  for (let i = resolvedBuffer.length - 1; ; i--) {
    str += resolvedBuffer[i];
    i--;
    if (i < 0) {
      break;
    }
    let r = resolvedBuffer[i];
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    const isEscaped = r.isEscaped;
    r = await (typeof r === "object" ? r.toString() : r);
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    if (r.isEscaped ?? isEscaped) {
      str += r;
    } else {
      const buf = [str];
      escapeToBuffer(r, buf);
      str = buf[0];
    }
  }
  return raw(str, callbacks);
};
var escapeToBuffer = (str, buffer) => {
  const match = str.search(escapeRe);
  if (match === -1) {
    buffer[0] += str;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str.substring(lastIndex, index);
};
var resolveCallbackSync = (str) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return str;
  }
  const buffer = [str];
  const context = {};
  callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
  return buffer[0];
};

// node_modules/hono/dist/helper/html/index.js
var html = (strings, ...values) => {
  const buffer = [""];
  for (let i = 0, len = strings.length - 1; i < len; i++) {
    buffer[0] += strings[i];
    const children = Array.isArray(values[i]) ? values[i].flat(Infinity) : [values[i]];
    for (let i2 = 0, len2 = children.length; i2 < len2; i2++) {
      const child = children[i2];
      if (typeof child === "string") {
        escapeToBuffer(child, buffer);
      } else if (typeof child === "number") {
        ;
        buffer[0] += child;
      } else if (typeof child === "boolean" || child === null || child === void 0) {
        continue;
      } else if (typeof child === "object" && child.isEscaped) {
        if (child.callbacks) {
          buffer.unshift("", child);
        } else {
          const tmp = child.toString();
          if (tmp instanceof Promise) {
            buffer.unshift("", tmp);
          } else {
            buffer[0] += tmp;
          }
        }
      } else if (child instanceof Promise) {
        buffer.unshift("", child);
      } else {
        escapeToBuffer(child.toString(), buffer);
      }
    }
  }
  buffer[0] += strings.at(-1);
  return buffer.length === 1 ? "callbacks" in buffer ? raw(resolveCallbackSync(raw(buffer[0], buffer.callbacks))) : raw(buffer[0]) : stringBufferToString(buffer, buffer.callbacks);
};

// netlify/edge-functions/index.ts
var app = new import_mod.Hono({ strict: true });
app.get("/", (c) => {
  return c.html(html`<html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>cpliege.be.ics</title>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossorigin="anonymous"
      />
    </head>
    <body>
      <div class="container">
        <nav class="navbar bg-body-tertiary">
          <div class="container-fluid">
            <span class="navbar-brand mb-0 h1">cpliege.ics</span>
          </div>
        </nav>

        <form class="row g-3 align-items-center" id="clubDivisionForm">
          <div class="col-auto">
            <label for="clubSelect" class="form-label mb-0">Club</label>
            <select class="form-select" id="clubSelect" name="club">
              <option selected disabled>Choose club...</option>
            </select>
          </div>
          <div class="col-auto">
            <label for="divisionSelect" class="form-label mb-0">Division</label>
            <select
              class="form-select"
              id="divisionSelect"
              name="division"
              disabled
            >
              <option selected disabled>Choose division...</option>
            </select>
          </div>
        </form>

        <div id="gamesTableContainer" class="mt-4"></div>

        <script>
          async function fetchClubs() {
            const res = await fetch("/api/clubs");
            const { data } = await res.json();
            const clubSelect = document.getElementById("clubSelect");
            data.forEach((club) => {
              const option = document.createElement("option");
              option.value = club.clubId;
              option.textContent = club.name;
              clubSelect.appendChild(option);
            });
          }

          async function fetchDivisions(clubId) {
            const res = await fetch(
              "/api/clubs/_clubId_".replace("_clubId_", clubId)
            );
            const { divisions } = await res.json();
            const divisionSelect = document.getElementById("divisionSelect");
            divisionSelect.innerHTML =
              "<option selected disabled>Choose division...</option>";
            divisions.forEach((division, idx) => {
              const option = document.createElement("option");
              option.value = division.name;
              option.textContent = division.name;
              divisionSelect.appendChild(option);
            });
            divisionSelect.disabled = false;

            // Select first division and show games
            if (divisions.length > 0) {
              divisionSelect.value = divisions[0].name;
              showGamesTable(divisions[0].games, divisions[0].name);
            } else {
              showGamesTable([], "");
            }
          }

          async function fetchGames(clubId, divisionName) {
            const res = await fetch(
              "/api/clubs/_clubId_/_divisionName_"
                .replace("_clubId_", clubId)
                .replace("_divisionName_", divisionName)
            );
            const { division } = await res.json();
            showGamesTable(division?.games ?? [], division?.name ?? "");
          }

          function showGamesTable(games, divisionName) {
            const container = document.getElementById("gamesTableContainer");
            if (!games || games.length === 0) {
              container.innerHTML = divisionName
                ? "<h5>_divisionName_</h5><p>No games found.</p>".replace(
                    "_divisionName_",
                    divisionName
                  )
                : "";
              return;
            }
            let tableHtml = \`<h5>\${divisionName}</h5>
              <table class="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date & Time</th>
                    <th>Home Team</th>
                    <th>Away Team</th>
                  </tr>
                </thead>
                <tbody>\`;
            games.forEach((game) => {
              const dt = game.datetime
                ? new Date(game.datetime).toLocaleString()
                : "";
              tableHtml += \`<tr>
                <td class="font-monospace">\${game.matchId}</td>
                <td class="font-monospace">
                  <time datetime="\${dt}">\${dt}</time>
                </td>
                <td>\${game.homeTeam}</td>
                <td>\${game.awayTeam}</td>
              </tr>\`;
            });
            tableHtml += "</tbody></table>";
            container.innerHTML = tableHtml;
          }

          document
            .getElementById("clubSelect")
            .addEventListener("change", function () {
              fetchDivisions(this.value);
            });

          document
            .getElementById("divisionSelect")
            .addEventListener("change", function () {
              const clubId = document.getElementById("clubSelect").value;
              const divisionName = this.value;
              if (clubId && divisionName) {
                fetchGames(clubId, divisionName);
              }
            });

          document
            .getElementById("clubDivisionForm")
            .addEventListener("submit", function (e) {
              e.preventDefault();
              const clubId = document.getElementById("clubSelect").value;
              const divisionName =
                document.getElementById("divisionSelect").value;
              if (clubId && divisionName) {
                window.location.href = "/api/clubs/_clubId_/_divisionName_.ics"
                  .replace("_clubId_", clubId)
                  .replace("_divisionName_", divisionName);
              }
            });

          fetchClubs();
        </script>
      </div>
    </body>
  </html>`);
});
app.get("/api/clubs", async (c) => {
  const res = await fetch("https://cpliege.be/caleclub.asp");
  const html2 = await res.text();
  const doc = new import_deno_dom_wasm.DOMParser().parseFromString(html2, "text/html");
  const cells = Array.from(doc.querySelectorAll("td")).slice(2);
  const data = Array.from(cells).filter((cell) => cell.textContent.trim() !== "").map((cell) => {
    const textContent = cell.textContent.trim().replaceAll("\n", "").replaceAll("  ", " ").replaceAll("\uFFFD", "");
    const [clubId, ...nameParts] = textContent.split(" ");
    return {
      clubId: clubId.padStart(4, "0"),
      name: nameParts.join(" ")
    };
  });
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
  return c.json({ data: sortedData });
});
var cleanDivision = (name) => {
  return name.trim().replaceAll("\n", "").replaceAll("  ", " ").replaceAll("\uFFFD", "");
};
var getDivisions = async (clubId) => {
  const url = `https://cpliege.be/clubs/club${clubId}.asp`;
  const res = await fetch(url);
  const html2 = await res.text();
  const doc = new import_deno_dom_wasm.DOMParser().parseFromString(html2, "text/html");
  const isDivisionRow = (row) => row.getAttribute("height") === "40";
  const isGameRow = (row) => row.getAttribute("height") === "17";
  const isSpacingRow = (row) => row.getAttribute("height") === "53";
  const rows = Array.from(doc.querySelectorAll("tr")).filter(
    (row) => isDivisionRow(row) || isGameRow(row) || isSpacingRow(row)
  );
  const divisions = [];
  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll("td"));
    if (isDivisionRow(row)) {
      divisions.push(new Division(cleanDivision(cells[0].textContent)));
      continue;
    }
    if (isGameRow(row)) {
      const currentDivision = divisions[divisions.length - 1];
      let date = null;
      if (cells[3] && cells[4]) {
        const dateParts = cells[3].textContent.trim().split("/");
        if (dateParts.length === 3) {
          const [day, month, year] = dateParts;
          const dateStr = `20${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}T${cells[4].textContent.trim().replaceAll(".", ":")}:00`;
          date = new Date(dateStr);
        }
      }
      currentDivision.games.push({
        matchId: cells[0].textContent.trim(),
        datetime: date,
        homeTeam: cleanDivision(cells[5].textContent.trim()),
        awayTeam: cleanDivision(cells[6].textContent.trim()),
        coupeDivision: cleanDivision(cells[7].textContent.trim())
      });
      continue;
    }
  }
  const filteredDivisions = divisions.filter(
    (division) => division.name !== "COUPE"
  );
  return filteredDivisions;
};
app.get("/api/clubs/:clubId", async (c) => {
  const divisions = await getDivisions(c.req.param("clubId"));
  return c.json({ divisions });
});
app.get("/api/clubs/:clubId/:divisionName{.+\\.ics}", async (c) => {
  const { clubId, divisionName } = c.req.param();
  const divisions = await getDivisions(clubId);
  const division = divisions.find(
    (div) => div.name === divisionName.replace(".ics", "")
  );
  if (!division) {
    return c.text("Division not found", 404);
  }
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//cpliege//NONSGML v1.0//EN"
  ];
  for (const game of division.games) {
    if (!game.datetime)
      continue;
    const dt = game.datetime;
    const dtStart = dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const dtEnd = new Date(dt.getTime() + 2 * 60 * 60 * 1e3).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    icsLines.push(
      "BEGIN:VEVENT",
      `UID:${game.matchId}@cpliege.be`,
      `DTSTAMP:${dtStart}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${game.homeTeam} vs ${game.awayTeam}`,
      `DESCRIPTION:Division: ${division.name}, Coupe: ${game.coupeDivision}`,
      "END:VEVENT"
    );
  }
  icsLines.push("END:VCALENDAR");
  const result = icsLines.join("\r\n");
  const options = {
    "Content-Type": "text/calendar; charset=utf-8",
    "Content-Disposition": `attachment; filename="${division.name}.ics"`
  };
  return c.text(result, 200, c.req.query("file") ? options : void 0);
});
app.get("/api/clubs/:clubId/:divisionName", async (c) => {
  const divisions = await getDivisions(c.req.param("clubId"));
  const division = divisions.find(
    (div) => div.name === c.req.param("divisionName")
  );
  return c.json({ division });
});
var Division = class {
  constructor(name) {
    __publicField(this, "name");
    __publicField(this, "games");
    this.name = name;
    this.games = [];
  }
};
var edge_functions_default = (0, import_netlify.handle)(app);
