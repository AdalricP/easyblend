import Logo from "../_components/Logo";
import Interstitial from "../_components/Interstitial";
import { getPageByUsername, nextLinkForVisit } from "@/lib/db";
import { RESERVED } from "@/lib/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // run on every visit; never cache the rotation

export default async function UserPage({ params }) {
  const handle = params.username;

  let url = null;
  let page = null;
  if (!RESERVED.has(handle.toLowerCase())) {
    page = await getPageByUsername(handle);
    if (page) url = await nextLinkForVisit(page);
  }

  if (url) {
    return (
      <div className="card">
        <Logo />
        <Interstitial url={url} who={page.display_name || page.handle} />
      </div>
    );
  }

  return (
    <div className="card">
      <Logo />
      <h1>No blend here yet.</h1>
      <p className="lede">
        <span className="name">{handle}</span> hasn&apos;t set up a BlendBox. If this is
        you, claim it now.
      </p>
      <a className="btn" href={`/?claim=${encodeURIComponent(handle)}`}>
        Create this BlendBox
      </a>
    </div>
  );
}
