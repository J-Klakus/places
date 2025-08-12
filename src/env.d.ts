type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user:
      | (import("better-auth").User & {
          role: string;
          banned: boolean;
          banReason: string | null;
          banExpires: Date | null;
        })
      | null;
    session: import("better-auth").Session | null;
  }
}
