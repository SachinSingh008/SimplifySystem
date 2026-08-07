interface Props {
  selected: 1 | 2 | 3;
  onChange: (t: 1 | 2 | 3) => void;
}

const templates = [
  { id: 1, name: "Classic", desc: "Traditional" },
  { id: 2, name: "Modern", desc: "Bold header" },
  { id: 3, name: "Minimal", desc: "Clean & simple" },
] as const;

export default function TemplateSelector({ selected, onChange }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-poppins font-semibold text-slate-900 text-sm mb-3">Template</h3>
      <div className="grid grid-cols-3 gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            id={`template-${t.id}`}
            onClick={() => onChange(t.id)}
            className={`p-3 rounded-xl border-2 text-xs transition-all text-center ${
              selected === t.id
                ? "border-green-brand-500 bg-green-brand-50 text-green-brand-700"
                : "border-slate-200 text-slate-600 hover:border-green-brand-300"
            }`}
          >
            <div className="font-semibold">{t.name}</div>
            <div className="text-slate-400 mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
