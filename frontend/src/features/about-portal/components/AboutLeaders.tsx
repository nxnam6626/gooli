import { leaders } from './data';

export default function AboutLeaders() {
  return (
    <section
      className="bg-[#FAFAFA] border-t border-neutral-200/60"
      style={{ padding: 'clamp(40px, 5vw, 64px) 0' }}
    >
      <div className="container-gooli">
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
          style={{ marginBottom: '48px' }}
        >
          BAN ĐIỀU HÀNH
        </h2>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 max-w-5xl mx-auto"
          style={{ gap: '32px' }}
        >
          {leaders.map((leader, i) => (
            <div
              key={leader.name}
              className="flex flex-col sm:flex-row border border-neutral-200 bg-white items-start sm:items-center rounded-lg"
              style={{ padding: '24px', gap: '24px' }}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center relative overflow-hidden select-none">
                <svg
                  className="w-14 h-14 text-neutral-400 mt-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h4
                  className="text-[11px] font-bold text-[#B06518] uppercase tracking-widest"
                  style={{ marginBottom: '4px' }}
                >
                  {i === 0 ? 'CEO BIOGRAPHY' : 'CTO BIOGRAPHY'}
                </h4>
                <h3
                  className="text-lg font-bold text-neutral-900 tracking-tight"
                  style={{ marginBottom: '8px' }}
                >
                  {leader.name} —{' '}
                  <span className="text-neutral-500 text-sm font-medium">
                    {leader.role}
                  </span>
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-light">
                  {leader.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
