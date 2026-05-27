export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");

  return Response.json({
    status: "queued",
    received: files.map((file) => ({
      name: file instanceof File ? file.name : "unknown",
      size: file instanceof File ? file.size : 0,
    })),
  });
}
