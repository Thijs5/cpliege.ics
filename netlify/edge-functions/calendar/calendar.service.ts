import { Team } from "../teams/team.model.ts";

export const generateICS = (team: Team): string => {
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//cpliege//NONSGML v1.0//EN",
  ];

  for (const game of team.games) {
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
      `DESCRIPTION:Division: ${team.teamName.value}, Coupe: ${game.coupeDivision.value}`,
      "END:VEVENT"
    );
  }

  icsLines.push("END:VCALENDAR");

  return icsLines.join("\r\n");
};
