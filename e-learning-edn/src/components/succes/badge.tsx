"use client";
export default function Badge({
  formationTitle,
  score,
}: {
  formationTitle: string;
  score: number;
}) {
  return (
    <div className="w-[260px] h-[100px] inline-flex flex-row items-center border p-4 gap-5">
      <img
        src="/badge.png"
        alt="badge de fin de formation"
        className="max-w-[64px] max-h-[64px]"
      />
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-xl font-bold">{formationTitle}</h1>
        <p className="  font-bold">
          Score: <span className="edn-color-primary">{score}%</span>
        </p>
      </div>
    </div>
  );
}
