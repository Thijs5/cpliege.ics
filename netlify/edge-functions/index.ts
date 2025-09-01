import { Hono, Context } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { handle } from "https://deno.land/x/hono@v4.3.11/adapter/netlify/index.ts";
import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { html, raw } from "hono/html";

const app = new Hono({ strict: true });

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

app.get("/api/clubs", async (c: Context) => {
  const res = await fetch("https://cpliege.be/caleclub.asp");
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  const cells = Array.from(doc.querySelectorAll("td")).slice(2);
  const data = Array.from(cells)
    .filter((cell: Element) => cell.textContent.trim() !== "")
    .map((cell: Element) => {
      const textContent = cell.textContent
        .trim()
        .replaceAll("\n", "")
        .replaceAll("  ", " ")
        .replaceAll("�", "");

      const [clubId, ...nameParts] = textContent.split(" ");
      return {
        clubId: clubId.padStart(4, "0"),
        name: nameParts.join(" "),
      };
    });

  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
  return c.json({ data: sortedData });
});

const cleanDivision = (name: string) => {
  return name
    .trim()
    .replaceAll("\n", "")
    .replaceAll("  ", " ")
    .replaceAll("�", "");
};

const getDivisions = async (clubId: string) => {
  const url = `https://cpliege.be/clubs/club${clubId}.asp`;
  const res = await fetch(url);
  const html = await res.text();

  const doc = new DOMParser().parseFromString(html, "text/html");

  const isDivisionRow = (row: Element) => row.getAttribute("height") === "40";
  const isGameRow = (row: Element) => row.getAttribute("height") === "17";
  const isSpacingRow = (row: Element) => row.getAttribute("height") === "53";

  const rows: Element[] = Array.from(doc.querySelectorAll("tr")).filter(
    (row: Element) => isDivisionRow(row) || isGameRow(row) || isSpacingRow(row)
  );

  const divisions: Division[] = [];
  for (const row of rows) {
    const cells: Element[] = Array.from(row.querySelectorAll("td"));
    if (isDivisionRow(row)) {
      divisions.push(new Division(cleanDivision(cells[0].textContent)));
      continue;
    }

    if (isGameRow(row)) {
      const currentDivision: Division = divisions[divisions.length - 1];
      let date: Date | null = null;
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
        coupeDivision: cleanDivision(cells[7].textContent.trim()),
      });
      continue;
    }
  }

  const filteredDivisions = divisions.filter(
    (division) => division.name !== "COUPE"
  );
  return filteredDivisions;
};

app.get("/api/clubs/:clubId", async (c: Context) => {
  const divisions = await getDivisions(c.req.param("clubId"));
  return c.json({ divisions });
});

app.get("/api/clubs/:clubId/:divisionName{.+\\.ics}", async (c: Context) => {
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
    "PRODID:-//cpliege//NONSGML v1.0//EN",
  ];

  for (const game of division.games) {
    if (!game.datetime) continue;
    const dt = game.datetime;
    const dtStart = dt
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
    const dtEnd = new Date(dt.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
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
    "Content-Disposition": `attachment; filename="${division.name}.ics"`,
  };
  return c.text(result, 200, c.req.query("file") ? options : undefined);
});

app.get("/api/clubs/:clubId/:divisionName", async (c: Context) => {
  const divisions = await getDivisions(c.req.param("clubId"));
  const division = divisions.find(
    (div) => div.name === c.req.param("divisionName")
  );
  return c.json({ division });
});

class Division {
  name: string;
  games: Game[];

  constructor(name: string) {
    this.name = name;
    this.games = [];
  }
}

type Game = {
  matchId: string;
  datetime: Date | null;
  homeTeam: string;
  awayTeam: string;
  coupeDivision: string;
};

export default handle(app);
