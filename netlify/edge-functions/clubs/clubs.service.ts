import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { Club, ClubId } from "./club.model.ts";

export const getClubs = async (): Promise<Club[]> => {
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
      return new Club(new ClubId(clubId), nameParts.join(" "));
    });

  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
  return sortedData;
};
