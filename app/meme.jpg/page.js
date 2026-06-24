export const metadata = { title: "the meme" };

export default function MemePage() {
  return (
    <div className="meme-wrap">
      <div className="meme-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/the-meme.jpg" alt="the meme that started it all" className="meme-img" />
        <div className="meme-cap top">
          sending people 100 links to get to 100 spotify blends within the month
        </div>
        <div className="meme-cap bot">creating an entire website for this shit</div>
      </div>
    </div>
  );
}
