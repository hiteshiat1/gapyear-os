import type { SyllabusDefinition } from "./types";

const p1 = { code: "7136-1", name: "Paper 1 - Markets and Market Failure" };
const p2 = { code: "7136-2", name: "Paper 2 - National and International Economy" };
const p3 = { code: "7136-3", name: "Paper 3 - Economic Principles and Issues" };

export const aqaEconomics7136: SyllabusDefinition = {
  key: "aqa-economics-7136",
  subjectName: "Economics (AQA)",
  shortName: "Economics (AQA)",
  examBoard: "AQA",
  specificationCode: "7136",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, p3],
  topics: [
    module("7136.MICRO", "Individuals, firms, markets and market failure", "3.1", p1, 1),
    topic("7136.MICRO.ECONOMIC_METHODOLOGY", "7136.MICRO", "Economic methodology and the economic problem", "3.1.1", p1, 10),
    topic("7136.MICRO.PRICE_DETERMINATION", "7136.MICRO", "Price determination in a competitive market", "3.1.2", p1, 20),
    topic("7136.MICRO.PRICE_SYSTEM_MARKET_FAILURE", "7136.MICRO", "Production, costs and revenue", "3.1.3", p1, 30),
    topic("7136.MICRO.COMPETITIVE_MARKETS", "7136.MICRO", "Perfect competition, imperfectly competitive markets and monopoly", "3.1.4", p1, 40),
    topic("7136.MICRO.EFFICIENCY", "7136.MICRO", "Efficiency and market failure", "3.1.5", p1, 50, true),
    topic("7136.MICRO.LABOUR_MARKET", "7136.MICRO", "The labour market", "3.1.6", p1, 60, true),
    topic("7136.MICRO.INCOME_WEALTH", "7136.MICRO", "The distribution of income and wealth", "3.1.7", p1, 70, true),
    topic("7136.MICRO.GOVERNMENT_INTERVENTION", "7136.MICRO", "The role of government in the market", "3.1.8", p1, 80, true),

    module("7136.MACRO", "The national and international economy", "3.2", p2, 200),
    topic("7136.MACRO.NATIONAL_ECONOMY_MEASURES", "7136.MACRO", "The measurement of macroeconomic performance", "3.2.1", p2, 210),
    topic("7136.MACRO.CIRCULAR_FLOW", "7136.MACRO", "How the macroeconomy works: the circular flow, AD/AS analysis", "3.2.2", p2, 220),
    topic("7136.MACRO.ECONOMIC_PERFORMANCE", "7136.MACRO", "Economic performance", "3.2.3", p2, 230),
    topic("7136.MACRO.FINANCIAL_SECTOR", "7136.MACRO", "Financial markets and monetary policy", "3.2.4", p2, 240, true),
    topic("7136.MACRO.FISCAL_POLICY", "7136.MACRO", "Fiscal policy and supply-side policies", "3.2.5", p2, 250, true),
    topic("7136.MACRO.INTERNATIONAL_ECONOMICS", "7136.MACRO", "The international economy and trade", "3.2.6", p2, 260, true),
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
