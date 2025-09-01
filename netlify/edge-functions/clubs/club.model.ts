export class Club {
  readonly name: string;

  constructor(public readonly id: ClubId, name: string) {
    this.name = name.trim();
  }
}

export class ClubId {
  readonly value: string;

  constructor(value: string) {
    this.value = value.padStart(4, "0");
  }
}