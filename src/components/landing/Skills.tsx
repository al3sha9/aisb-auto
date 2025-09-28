const skills = [
  "Prompt Engineering",
  "AI Chatbots",
  "No-Code AI Automation",
  "RAG",
  "AI Content Creation",
  "AI Agents",
  "Integrations",
];

export default function Skills() {
  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Skills You Will Master</h2>
      <div className="flex flex-wrap gap-3 justify-center">
        {skills.map((skill) => (
          <span key={skill} className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm flex items-center gap-2">
            {/* Placeholder icon */}
            <span className="text-lg">⚡</span>
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
