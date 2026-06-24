export const metadata = { title: "the meme" };

export default function MemePage() {
  return (
    <div className="meme-wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/the-meme.jpg" alt="the meme that started it all" className="meme-img" />
    </div>
  );
}
