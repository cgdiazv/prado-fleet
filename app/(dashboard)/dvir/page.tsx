import DVIRForm from "@/components/dvir/DVIRForm";

export default function DVIRPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
          Mobile Inspection
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Digital DVIR Checklist
        </h1>
        <p className="text-sm text-slate-600">
          Complete pre-trip and post-trip inspections from the field and push flagged defects into Prado Jobs and Prado Commerce.
        </p>
      </div>

      <DVIRForm />
    </div>
  );
}