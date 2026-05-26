export function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

function write(level, event, meta = {}) {
  const payload = {
    level,
    event,
    ts: new Date().toISOString(),
    ...meta
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const log = {
  info(event, meta = {}) {
    write("info", event, meta);
  },
  warn(event, meta = {}) {
    write("warn", event, meta);
  },
  error(event, meta = {}) {
    write("error", event, meta);
  }
};
