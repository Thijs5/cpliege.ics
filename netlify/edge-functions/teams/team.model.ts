import { ClubId } from "../clubs/club.model.ts";

export class Team {
  constructor(
    public readonly clubId: ClubId,
    public readonly teamName: TeamName,
    public readonly games: Game[] = []) {}

  isCoupe(): boolean {
    return this.teamName.value === "COUPE";
  }
}

export class TeamName {
  readonly value: string;

  constructor(value: string) {
    this.value = value
      .trim()
      .replaceAll("\n", "")
      .replaceAll("  ", " ")
      .replaceAll(".ics", "")
      .replaceAll("�", "");
  }
}

export class Game {
  constructor(
    public readonly matchId: string,
    public readonly datetime: Date | null,
    public readonly homeTeam: TeamName,
    public readonly awayTeam: TeamName,
    public readonly coupeDivision: TeamName,
  ) {}
}
