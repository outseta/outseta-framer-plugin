import { ExternalLinkIcon } from "./assets/ExternalLink";

import classes from "./LinkList.module.css";

export function LinkList({ children }: { children: React.ReactNode }) {
  return <div className={classes.list}>{children}</div>;
}

export function LinkListItem({
  title,
  subtitle,
  url,
}: {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  url: string;
}) {
  return (
    <div className={`button ${classes.item}`}>
      <div>
        <h3>
          <a href={url} target="_blank">
            {title}
          </a>
        </h3>
        <p>{subtitle}</p>
      </div>
      <ExternalLinkIcon />
    </div>
  );
}
