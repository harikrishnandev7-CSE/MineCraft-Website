# Judge0 Configuration

Details on configuring sandboxed limits inside `judge0.conf`:
- `MAX_CPU_TIME_LIMIT`: Max compute time permitted per execution (seconds).
- `MAX_MEMORY_LIMIT`: RAM memory ceiling per submission (KB).
- Worker scaling: Use `docker compose up --scale judge0-workers=4 -d` for high concurrency.
