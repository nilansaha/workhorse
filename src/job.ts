import { sql } from "./db";
import { parseDelay } from "./delay";
import { register } from "./registry";

type JobConfig<T> = {
  id: string;
  maxAttempts?: number;
  run: (payload: T) => Promise<void>;
};

type RunOptions = {
  delay?: string;
};

type JobHandle<T> = {
  id: string;
  run: (payload: T, options?: RunOptions) => Promise<string>;
};

export const job = <T>(config: JobConfig<T>): JobHandle<T> => {
  const maxAttempts = config.maxAttempts ?? 3;

  register(config.id, config.run as (payload: any) => Promise<void>);

  return {
    id: config.id,
    run: async (payload: T, options?: RunOptions) => {
      const scheduled = options?.delay != null;
      const runAt = scheduled
        ? new Date(Date.now() + parseDelay(options.delay!))
        : new Date();

      const [row] = await sql`
        INSERT INTO workhorse (job_name, payload, max_attempts, run_at, scheduled)
        VALUES (
          ${config.id},
          ${sql.json(payload as Parameters<typeof sql.json>[0])},
          ${maxAttempts},
          ${runAt},
          ${scheduled}
        )
        RETURNING id
      `;

      return row.id;
    },
  };
};
