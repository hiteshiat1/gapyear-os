import { aqaPhysics7408C } from "./aqa-physics-7408c";
import { edexcelFurtherMaths9FM0E0 } from "./edexcel-further-maths-9fm0-e0";
import { edexcelMaths9MA0 } from "./edexcel-maths-9ma0";
import { aqaMaths7357 } from "./aqa-maths-7357";
import { aqaFurtherMaths7367 } from "./aqa-further-maths-7367";
import { edexcelPhysics9PH0 } from "./edexcel-physics-9ph0";
import { aqaBiology7402 } from "./aqa-biology-7402";
import { edexcelBiology9BI0 } from "./edexcel-biology-9bi0";
import { aqaChemistry7405 } from "./aqa-chemistry-7405";
import { edexcelChemistry9CH0 } from "./edexcel-chemistry-9ch0";
import { aqaComputerScience7517 } from "./aqa-computer-science-7517";
import { edexcelComputerScience9CP0 } from "./edexcel-computer-science-9cp0";
import { aqaEconomics7136 } from "./aqa-economics-7136";
import { edexcelEconomics9EC0 } from "./edexcel-economics-9ec0";
import { aqaEnglishLiterature7712 } from "./aqa-english-literature-7712";
import { edexcelEnglishLiterature9ET0 } from "./edexcel-english-literature-9et0";
import type { SyllabusDefinition, SyllabusSubjectKey } from "./types";

export const syllabusDefinitions = [
  edexcelMaths9MA0,
  edexcelFurtherMaths9FM0E0,
  aqaPhysics7408C,
  aqaMaths7357,
  aqaFurtherMaths7367,
  edexcelPhysics9PH0,
  aqaBiology7402,
  edexcelBiology9BI0,
  aqaChemistry7405,
  edexcelChemistry9CH0,
  aqaComputerScience7517,
  edexcelComputerScience9CP0,
  aqaEconomics7136,
  edexcelEconomics9EC0,
  aqaEnglishLiterature7712,
  edexcelEnglishLiterature9ET0,
] satisfies SyllabusDefinition[];

export function getSyllabusDefinition(key: SyllabusSubjectKey) {
  return syllabusDefinitions.find((definition) => definition.key === key);
}
