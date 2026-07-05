import { coreValues, type CoreValue } from './data';

const ICONS: Record<CoreValue['iconId'], React.ReactNode> = {
  trust: (
    <svg
      className="w-8 h-8 text-[#B06518]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110.5 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0113.5 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
      />
    </svg>
  ),
  quality: (
    <svg
      className="w-8 h-8 text-[#B06518]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  ),
  care: (
    <svg
      className="w-8 h-8 text-[#B06518]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  ),
  partner: (
    <svg
      className="w-8 h-8 text-[#B06518]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.771m.002 0a5.971 5.971 0 00-.94 3.197m.94-3.197a5.971 5.971 0 00-.94-3.197M6 14.25a3 3 0 00-3 3v.31m14-10.5c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
      />
    </svg>
  ),
};

export default function AboutCoreValues() {
  return (
    <section
      className="bg-white border-t border-neutral-100"
      style={{ padding: 'clamp(40px, 5vw, 64px) 0' }}
    >
      <div className="container-gooli">
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
          style={{ marginBottom: '48px' }}
        >
          GIÁ TRỊ CỐT LÕI
        </h2>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
          style={{ gap: '32px' }}
        >
          {coreValues.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center p-4 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="w-16 h-16 rounded-full border border-[#B06518]/25 flex items-center justify-center bg-white shadow-sm"
                style={{ marginBottom: '24px' }}
              >
                {ICONS[item.iconId]}
              </div>
              <h3
                className="font-bold text-neutral-900 tracking-wider text-sm"
                style={{ marginBottom: '12px' }}
              >
                {item.title}
              </h3>
              <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-light max-w-[240px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
