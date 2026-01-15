import type { CompositeFilterDescriptor, FilterDescriptor, GroupDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { FilterRequest } from '@rosoftlab/core';

/** Main mapper */
export function kendoToFilterRequest(e: State): FilterRequest {
  const { skip = 0, take = 0, sort, filter, group } = e ?? (e as any);

  const page_size = take || undefined;
  const page = take ? Math.floor(skip / take) + 1 : undefined;

  return {
    page,
    page_size,
    sorts: kendoSortsToDict(sort),
    filters: kendoFilterToSieve(filter),
    group_by: kendoGroupToArray(group)
    // distinctColumns: fill if you use a “distinct” mode in your API
  };
}

/* ------------------------------- Sorts ---------------------------------- */

function kendoSortsToDict(sorts?: SortDescriptor[] | null): Record<string, 'asc' | 'desc'> | undefined {
  if (!sorts?.length) return undefined;
  const result: Record<string, 'asc' | 'desc'> = {};
  for (const s of sorts) {
    if (!s.field) continue;
    result[s.field] = (s.dir ?? 'asc') as 'asc' | 'desc';
  }
  return result;
}

/* ---------------- GroupBy as array ---------------- */
function kendoGroupToArray(group?: GroupDescriptor[] | null): string[] | undefined {
  if (!group?.length) return undefined;
  return group.map((g) => g.field);
}
/* ------------------------------ Filters --------------------------------- */

/**
 * Converts Kendo filter tree to a Sieve filter string.
 * Notes (Sieve):
 * - Clause is {Name}{Operator}{Value}, AND with commas, simple OR via:
 *   - multiple names: (Field1|Field2)opValue
 *   - multiple values: Field@=a|b
 * - Operators: ==, !=, >, <, >=, <=, @= (contains), _= (starts), _-= (ends),
 *   and case-insensitive variants like @=* etc. :contentReference[oaicite:1]{index=1}
 */
function kendoFilterToSieve(node?: CompositeFilterDescriptor | FilterDescriptor | null): string | undefined {
  if (!node) return undefined;

  if (isLeaf(node)) {
    const op = mapOperator(node.operator, !!node.ignoreCase, node.value);
    if (!op) return undefined; // unsupported operator (e.g., isnull/isnotnull)
    const name = node.field;
    const value = formatSieveValue(node.value);
    return `${name}${op}${value}`;
  }

  // Composite: best-effort mapping.
  // AND → comma-join
  // OR  → try to compress same-field same-op OR into value pipes; otherwise fall back to (Field1|Field2)opValue when viable.
  const parts = node.filters.map((f) => kendoFilterToSieve(f as any)).filter(Boolean) as string[];

  if (!parts.length) return undefined;

  if (node.logic === 'and') {
    return parts.join(',');
  }

  // OR logic – try simple compressions; if not possible, return a comma-joined set of grouped OR chunks when possible.
  // Heuristic: if all parts share the same {field,op} with different values → merge via value pipes.
  const parsed = parts.map(parseClause).filter(Boolean) as ParsedClause[];
  if (parsed.length && allSame(parsed, (c) => `${c.name}|${c.op}`)) {
    const { name, op } = parsed[0];
    const pipedValues = parsed.map((c) => c.value).join('|');
    return `${name}${op}${pipedValues}`;
  }

  // If all parts share same {op,value} but different fields → (A|B)opV
  if (parsed.length && allSame(parsed, (c) => `${c.op}|${c.value}`)) {
    const fields = parsed.map((c) => c.name).join('|');
    const { op, value } = parsed[0];
    return `(${fields})${op}${value}`;
  }

  // Fallback: join with Sieve’s AND (comma). (General mixed OR trees can’t always be represented in Sieve DSL.
  // If you need exact semantics, consider adding a custom Sieve filter.) :contentReference[oaicite:2]{index=2}
  return parts.join(',');
}

/* ----------------------------- Helpers ---------------------------------- */

function isLeaf(f: CompositeFilterDescriptor | FilterDescriptor): f is FilterDescriptor {
  return (f as CompositeFilterDescriptor).filters === undefined;
}

// Map Kendo operators to Sieve operators (case-insensitive variants when ignoreCase=true)
function mapOperator(kendoOp: FilterDescriptor['operator'], ignoreCase: boolean, value: any): string | undefined {
  // Kendo operators list: eq, neq, lt, lte, gt, gte, contains, doesnotcontain, startswith, endswith,
  // isnull, isnotnull, isempty, isnotempty
  // Sieve operators: ==, !=, <, <=, >, >=, @=, !@=, _=, _-=, and their * variants for case-insensitive. :contentReference[oaicite:3]{index=3}
  const strOps = {
    contains: '@=',
    doesnotcontain: '!@=',
    startswith: '_=',
    endswith: '_-='
  } as const;

  const base = (() => {
    switch (kendoOp) {
      case 'eq':
        return '==';
      case 'neq':
        return '!=';
      case 'lt':
        return '<';
      case 'lte':
        return '<=';
      case 'gt':
        return '>';
      case 'gte':
        return '>=';
      case 'contains':
        return strOps.contains;
      case 'doesnotcontain':
        return strOps.doesnotcontain;
      case 'startswith':
        return strOps.startswith;
      case 'endswith':
        return strOps.endswith;
      case 'isempty':
        return '=='; // value should be ''
      case 'isnotempty':
        return '!='; // value should be ''
      // isnull / isnotnull don’t have a native Sieve op. Recommend a custom filter on the API.
      case 'isnull':
      case 'isnotnull':
        return undefined;
      default:
        return undefined;
    }
  })();

  if (!base) return undefined;

  // Promote to case-insensitive *only* for string-y ops when requested
  const isStringy = ['@=', '!@=', '_=', '_-='].includes(base) || typeof value === 'string';
  if (ignoreCase && isStringy) {
    // Sieve: case-insensitive variants add a trailing * (e.g., @=*). :contentReference[oaicite:4]{index=4}
    return base.endsWith('*') ? base : `${base}*`;
  }
  return base;
}

function formatSieveValue(v: any): string {
  if (v === '' || v === null || v === undefined) return '';
  if (v instanceof Date) return toISO(v);
  // Kendo may send dates as strings – try to detect ISO-like and pass through
  if (typeof v === 'string' && isDateLike(v)) return v;
  if (typeof v === 'string') return escapeSieve(v);
  if (typeof v === 'number' || typeof v === 'bigint' || typeof v === 'boolean') return String(v);
  // Arrays can appear with “in” like semantics via OR; join with pipes
  if (Array.isArray(v)) return v.map(formatSieveValue).join('|');
  // Fallback to JSON (rare)
  return escapeSieve(JSON.stringify(v));
}

function toISO(d: Date): string {
  // Prefer full ISO so the API can parse reliably
  // return new Date(d).toISOString();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
}

function isDateLike(s: string): boolean {
  // very lenient check
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s);
}

function escapeSieve(s: string): string {
  // Sieve escaping: backslash to escape commas and pipes (and the backslash itself). :contentReference[oaicite:5]{index=5}
  return s.replace(/([\\,|])/g, '\\$1');
}

type ParsedClause = { name: string; op: string; value: string };

/** Parses "NameOPValue" (no commas) into {name,op,value} */
function parseClause(clause: string): ParsedClause | null {
  // Operators (longer first)
  const ops = ['==*', '!=*', '@=*', '!@=*', '_=*', '!_=*', '_-=*', '==', '!=', '>=', '<=', '>', '<', '@=', '!@=', '_=', '_-='];
  for (const op of ops) {
    const idx = clause.indexOf(op);
    if (idx > 0) {
      return {
        name: clause.slice(0, idx),
        op,
        value: clause.slice(idx + op.length)
      };
    }
  }
  return null;
}

function allSame<T>(arr: T[], key: (x: T) => string): boolean {
  if (!arr.length) return true;
  const k0 = key(arr[0]);
  return arr.every((a) => key(a) === k0);
}
