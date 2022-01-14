import { Module } from '@nestjs/common';
import { Pool } from 'pg';

const rawDbProvider = {
  provide: 'PG_POOL',
  useValue: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 30,
  }),
};

@Module({
  providers: [rawDbProvider],
  exports: [rawDbProvider],
})
export class RawDbModule {}
