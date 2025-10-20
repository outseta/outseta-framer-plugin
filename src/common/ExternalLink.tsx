export function ExternalLink({
  href,
  campaign,
  children,
  ...props
}: {
  href: string;
  campaign?: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const urlWithUtm = addUtmParams(href, campaign);

  return (
    <a href={urlWithUtm} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function addUtmParams(url: string, campaign?: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.set("utm_source", "framer");
  urlObj.searchParams.set("utm_medium", "app");

  // Auto-detect campaign if not provided
  let detectedCampaign = campaign;

  if (!detectedCampaign) {
    switch (true) {
      case url.includes("/support/kb"):
        detectedCampaign = "kb";
        break;
      case url.includes("/#/app/"):
        detectedCampaign = "qcount";
        break;
      case url.endsWith("outseta.com"):
        detectedCampaign = "signup";
        break;
    }
  }
  if (detectedCampaign) {
    urlObj.searchParams.set("utm_campaign", detectedCampaign);
  }

  return urlObj.href;
}
