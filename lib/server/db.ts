import { prisma } from "./prisma";

export type DbQueryResult<T = Record<string, unknown>> = {
  rows: T[];
  rowCount: number;
};

function normalizeStatement(sql: string) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--.*$/gm, " ")
    .trim()
    .toLowerCase();
}

function startsWithReadKeyword(sql: string) {
  const normalized = normalizeStatement(sql);
  return /^(select|with|show|explain|values)\b/.test(normalized);
}

function hasReturningClause(sql: string) {
  return /\breturning\b/i.test(sql);
}

export async function query<T = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): Promise<DbQueryResult<T>> {
  const sql = text.trim();
  const readQuery = startsWithReadKeyword(sql) || hasReturningClause(sql);

  if (readQuery) {
    const rows = await prisma.$queryRawUnsafe<T[]>(sql, ...values);
    return {
      rows,
      rowCount: rows.length,
    };
  }

  const rowCount = await prisma.$executeRawUnsafe(sql, ...values);
  return {
    rows: [],
    rowCount: Number(rowCount),
  };
}
