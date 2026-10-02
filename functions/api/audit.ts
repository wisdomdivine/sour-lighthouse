import { runLightweightAudit } from "../../src/lib/auditor";

interface Env {}

export const onRequestPost = async (context: { request: Request }) => {
  try {
    const body = (await context.request.json()) as { url?: string };
    const url = body?.url;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid website address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await runLightweightAudit(url);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Something went wrong while testing this website";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
