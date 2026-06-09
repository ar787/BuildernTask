import type { FieldPacket, QueryOptions, QueryValues } from 'mysql2';
import type { QueryResult } from 'mysql2/promise';

declare module 'mysql2/promise' {
  interface Pool {
    query<T extends QueryResult>(sql: string, values?: QueryValues): Promise<[T, FieldPacket[]]>;
    query<T extends QueryResult>(options: QueryOptions, values?: QueryValues): Promise<[T, FieldPacket[]]>;
    execute<T extends QueryResult>(sql: string, values?: QueryValues): Promise<[T, FieldPacket[]]>;
    execute<T extends QueryResult>(options: QueryOptions, values?: QueryValues): Promise<[T, FieldPacket[]]>;
  }
}
