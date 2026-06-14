import Image from "next/image";

type PhoneMockupProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function PhoneMockup({
  src,
  alt,
  className = "",
  priority = false,
}: PhoneMockupProps) {
  return (
    <div className={`app-phone ${className}`.trim()}>
      <div className="app-phone-shell">
        <div className="app-phone-notch" aria-hidden />
        <div className="app-phone-screen">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 220px, 280px"
            className="app-phone-image"
            priority={priority}
          />
        </div>
      </div>
    </div>
  );
}
