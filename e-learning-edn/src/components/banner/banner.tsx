"use client";
export default function Banner({ title }: { title: string }) {
  return (
    <div className="edn-degraded p-4 text-center">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
    </div>
  );
}
