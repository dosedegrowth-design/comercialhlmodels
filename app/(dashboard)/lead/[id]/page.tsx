export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Detalhe do Lead</h1>
      <p className="text-sm text-muted-foreground mt-1">ID: {id}</p>
      <p className="text-sm text-muted-foreground mt-6">Implementação — Fase 3</p>
    </div>
  );
}
