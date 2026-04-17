interface BismillahProps {
  fontClass: string;
}

export function Bismillah({ fontClass }: BismillahProps) {
  return (
    <div className="text-center mb-6">
      <p className={`${fontClass} text-2xl text-foreground leading-loose`} dir="rtl">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
    </div>
  );
}