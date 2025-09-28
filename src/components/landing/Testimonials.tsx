const testimonials = [
  {
    name: "Ali",
    role: "Aspiring AI Leader",
    text: "AISB Bootcamp gave me the confidence and skills to pursue AI projects I never thought possible!",
  },
  {
    name: "Sara",
    role: "Future ML Engineer",
    text: "The hands-on approach and real-world projects set this program apart. Highly recommended!",
  },
  {
    name: "Ahmed",
    role: "AI Enthusiast",
    text: "I loved the community and the support. The free laptop was a huge bonus!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Hear from Our Community</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold mb-3">
              {/* Placeholder avatar */}
              {t.name[0]}
            </div>
            <div className="font-semibold text-lg text-primary mb-1">{t.name}</div>
            <div className="text-sm text-gray-500 mb-2">{t.role}</div>
            <div className="text-gray-700 text-center">{t.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
