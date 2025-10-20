import { ExternalLinkIcon } from "./assets/ExternalLink";
import { ExternalLink } from "./ExternalLink";

import classes from "./LinkList.module.css";

export function LinkList({ children }: { children: React.ReactNode }) {
  return <div className={classes.list}>{children}</div>;
}

export function LinkListItem({
  title,
  subtitle,
  url,
  campaign,
}: {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  url: string;
  campaign?: string;
}) {
  return (
    <div className={`button ${classes.item}`}>
      <div>
        <h3>
          <ExternalLink href={url} campaign={campaign}>
            {title}
          </ExternalLink>
        </h3>
        <p>{subtitle}</p>
      </div>
      <ExternalLinkIcon />
    </div>
  );
}
