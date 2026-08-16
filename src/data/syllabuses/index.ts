import { aqaPhysics7408C } from "./aqa-physics-7408c";
import { edexcelFurtherMaths9FM0E0 } from "./edexcel-further-maths-9fm0-e0";
import { edexcelMaths9MA0 } from "./edexcel-maths-9ma0";
import type { SyllabusDefinition, SyllabusSubjectKey } from "./types";

export const syllabusDefinitions = [
  edexcelMaths9MA0,
  edexcelFurtherMaths9FM0E0,
  aqaPhysics7408C,
] satisfies SyllabusDefinition[];

export function getSyllabusDefinition(key: SyllabusSubjectKey) {
  return syllabusDefinitions.find((definition) => definition.key === key);
}
