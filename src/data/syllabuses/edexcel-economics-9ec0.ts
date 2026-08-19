import type { SyllabusDefinition } from "./types";

const p1 = { code: "9EC0-01", name: "Paper 1 - Markets and Business Behaviour" };
const p2 = { code: "9EC0-02", name: "Paper 2 - The National and Global Economy" };
const p3 = { code: "9EC0-03", name: "Paper 3 - Microeconomics and Macroeconomics" };

export const edexcelEconomics9EC0: SyllabusDefinition = {
  key: "edexcel-economics-9ec0",
  subjectName: "Economics (Edexcel)",
  shortName: "Economics (Edexcel)",
  examBoard: "Pearson Edexcel",
  specificationCode: "9EC0",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, p3],
  topics: [
    module("9EC0.THEME1", "Theme 1: Introduction to markets and market failure", "Theme 1", p1, 1),
    topic("9EC0.THEME1.NATURE_ECONOMIC_PROBLEM", "9EC0.THEME1", "Nature of economics", "1.1", p1, 10),
    topic("9EC0.THEME1.HOW_MARKETS_WORK", "9EC0.THEME1", "How markets work", "1.2", p1, 20),
    topic("9EC0.THEME1.MARKET_FAILURE", "9EC0.THEME1", "Market failure", "1.3", p1, 30),
    topic("9EC0.THEME1.GOVERNMENT_INTERVENTION", "9EC0.THEME1", "Government intervention", "1.4", p1, 40),

    module("9EC0.THEME2", "Theme 2: The UK economy - performance and policies", "Theme 2", p2, 200),
    topic("9EC0.THEME2.MEASURES_ECONOMIC_PERFORMANCE", "9EC0.THEME2", "Measures of economic performance", "2.1", p2, 210),
    topic("9EC0.THEME2.AD_AS_MODEL", "9EC0.THEME2", "Aggregate demand and aggregate supply", "2.2", p2, 220),
    topic("9EC0.THEME2.NATIONAL_INCOME", "9EC0.THEME2", "National income", "2.3", p2, 230),
    topic("9EC0.THEME2.ECONOMIC_GROWTH", "9EC0.THEME2", "Economic growth", "2.4", p2, 240),
    topic("9EC0.THEME2.MACRO_OBJECTIVES_POLICIES", "9EC0.THEME2", "Macroeconomic objectives and policy", "2.5", p2, 250),

    module("9EC0.THEME3", "Theme 3: Business behaviour and the labour market", "Theme 3", p1, 300),
    topic("9EC0.THEME3.BUSINESS_GROWTH", "9EC0.THEME3", "Business growth", "3.1", p1, 310, true),
    topic("9EC0.THEME3.BUSINESS_OBJECTIVES", "9EC0.THEME3", "Business objectives", "3.2", p1, 320, true),
    topic("9EC0.THEME3.REVENUES_COSTS_PROFITS", "9EC0.THEME3", "Revenues, costs and profits", "3.3", p1, 330, true),
    topic("9EC0.THEME3.MARKET_STRUCTURES", "9EC0.THEME3", "Market structures", "3.4", p1, 340, true),
    topic("9EC0.THEME3.LABOUR_MARKET", "9EC0.THEME3", "Labour market", "3.5", p1, 350, true),
    topic("9EC0.THEME3.GOVERNMENT_INTERVENTION_BUSINESS", "9EC0.THEME3", "Government intervention", "3.6", p1, 360, true),

    module("9EC0.THEME4", "Theme 4: A global perspective", "Theme 4", p2, 400),
    topic("9EC0.THEME4.INTERNATIONAL_ECONOMICS", "9EC0.THEME4", "International economics", "4.1", p2, 410, true),
    topic("9EC0.THEME4.POVERTY_INEQUALITY", "9EC0.THEME4", "Poverty and inequality", "4.2", p2, 420, true),
    topic("9EC0.THEME4.EMERGING_DEVELOPING_ECONOMIES", "9EC0.THEME4", "Emerging and developing economies", "4.3", p2, 430, true),
    topic("9EC0.THEME4.GLOBAL_ECONOMY", "9EC0.THEME4", "The financial sector and the global economy", "4.4", p2, 440, true),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder };
}

function topic(
  code: string,
  parentCode: string,
  name: string,
  ref: string,
  paper: typeof p1,
  sortOrder: number,
  isOptional = false,
) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder, isOptional };
}
