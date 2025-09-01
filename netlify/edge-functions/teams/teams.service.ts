import {
    DOMParser,
    Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { ClubId } from "../clubs/club.model.ts";
import { Team, TeamName } from "./team.model.ts";

export const getTeams = async (clubId: ClubId): Promise<Team[]> => {
  const url = `https://cpliege.be/clubs/club${clubId.value}.asp`;
    const res = await fetch(url);
    const html = await res.text();
  
    const doc = new DOMParser().parseFromString(html, "text/html");
  
    const isTeamNameRow = (row: Element) => row.getAttribute("height") === "40";
    const isGameRow = (row: Element) => row.getAttribute("height") === "17";
    const isSpacingRow = (row: Element) => row.getAttribute("height") === "53";
  
    const rows: Element[] = Array.from(doc.querySelectorAll("tr")).filter(
      (row: Element) => isTeamNameRow(row) || isGameRow(row) || isSpacingRow(row)
    );
  
    const teams: Team[] = [];
    for (const row of rows) {
      const cells: Element[] = Array.from(row.querySelectorAll("td"));
      if (isTeamNameRow(row)) {
        const teamName = new TeamName(cells[0].textContent);
        const team = new Team(clubId, teamName);
        teams.push(team);
        continue;
      }
  
      if (isGameRow(row)) {
        const currentTeam: Team = teams[teams.length - 1];
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
        currentTeam.games.push({
          matchId: cells[0].textContent.trim(),
          datetime: date,
          homeTeam: new TeamName(cells[5].textContent),
          awayTeam: new TeamName(cells[6].textContent),
          coupeDivision: new TeamName(cells[7].textContent),
        });
        continue;
      }
    }
  
    const filteredTeams = teams.filter(
      (team) => !team.isCoupe()
    );
    return filteredTeams;
};

export const getTeam = async (clubId: ClubId, teamName: TeamName): Promise<Team | null> => {
  const teams = await getTeams(clubId);
  return teams.find((team) => team.teamName.value === teamName.value) || null;
};