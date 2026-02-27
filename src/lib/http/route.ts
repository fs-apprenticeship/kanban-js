import { NextResponse } from "next/server";
import { HttpError } from "./errors";

export function route<TCtx>(
  handler: (req: Request, ctx: TCtx) => Promise<Response>
) {
  return async (req: Request, ctx: TCtx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}