export async function POST(request: Request) {
  const body = await request.json();

  return Response.json({
    answer:
      "This is a mocked RAG response. Upload clinical documents to enrich local guidance.",
    prompt: body?.prompt ?? "",
  });
}
