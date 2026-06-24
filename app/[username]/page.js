import Wordmark from "../_components/Wordmark";
import Interstitial from "../_components/Interstitial";
import { getPageByUsername } from "@/lib/db";
import { RESERVED } from "@/lib/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // run on every visit; never cache

export default async function UserPage({ params }) {
  const handle = params.username;

  let page = null;
  if (!RESERVED.has(handle.toLowerCase())) {
    page = await getPageByUsername(handle);
  }

  if (page) {
    return (
      <div className="card">
        <Wordmark />
        <Interstitial handle={page.handle} />
      </div>
    );
  }

  return (
    <div className="card">
      <Wordmark />
      <h1>No blends here yet.</h1>
      <p className="lede">
        <span className="mono">{handle}</span> hasn&apos;t set up an easyblend. If this is
        you, claim it now.
      </p>
      <a className="btn" href={`/?claim=${encodeURIComponent(handle)}`}>
        Create this page
      </a>
    </div>
  );
}
