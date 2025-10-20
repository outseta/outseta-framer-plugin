import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { useConfiguration } from "../custom-code";
import { getContentGroupData } from "../outseta";

import classes from "./protected-content.module.css";
import { usePageQuery } from "../pages";
import { Alert } from "../common/Alert";
import { ExternalLink } from "../common";

export const Route = createFileRoute("/protected-content/")({
  component: ProtectedContent,
});

export function ProtectedContent() {
  const { domain, isInvalid } = useConfiguration();

  const outsetaDataQuery = useQuery({
    queryKey: ["outseta", "content-group", "all", domain],
    queryFn: () => getContentGroupData(domain),
    enabled: !!domain && !isInvalid,
  });

  const pageQuery = usePageQuery();
  const contentGroups = outsetaDataQuery.data?.items || [];
  const pagesWithContentGroupMatches =
    pageQuery.data
      ?.map((page) => {
        const matchedItems = contentGroups.filter((item) => {
          return item.ContentGroupItems.some(({ MatchMode, Pattern }) => {
            switch (MatchMode) {
              case 1:
                return page.path === `/${Pattern}`;
              case 2:
                return page.path?.startsWith(`/${Pattern}`);
              default:
                return false;
            }
          });
        });

        return {
          page,
          matchedItems,
        };
      })
      .filter(({ matchedItems }) => matchedItems.length > 0) || [];

  type Variant =
    | "loading"
    | "diconnected"
    | "no-content-groups"
    | "matches"
    | "no-matches"
    | "error";
  let variant: Variant = "loading";

  if (!domain) {
    variant = "diconnected";
  } else if (outsetaDataQuery.isSuccess && pageQuery.isSuccess) {
    if (contentGroups.length === 0) {
      variant = "no-content-groups";
    } else if (
      contentGroups.length > 0 &&
      pagesWithContentGroupMatches.length === 0
    ) {
      variant = "no-matches";
    } else if (
      contentGroups.length > 0 &&
      pagesWithContentGroupMatches.length > 0
    ) {
      variant = "matches";
    }
  } else if (outsetaDataQuery.isError || pageQuery.isError) {
    variant = "error";
  }

  return (
    <>
      {variant === "matches" && (
        <ul className={classes.root}>
          {pagesWithContentGroupMatches.map(({ page, matchedItems }) => {
            return (
              <li key={page.path} className={classes.item}>
                <h2>
                  Protected Page <code>{page.path}</code>
                </h2>
                <div>
                  {matchedItems.map((item) => {
                    return (
                      <div key={item.Uid}>
                        {item.AllowedPlans.length > 0 && (
                          <p>
                            Allowed plan
                            {item.AllowedPlans.length > 1 && <>s</>}
                            {": "}
                            {item.AllowedPlans.map(
                              ({ Uid, Name }, index, array) => (
                                <span key={Uid}>
                                  <strong key={Uid}>{Name}</strong>
                                  {index < array.length - 2 && <>, </>}
                                  {index === array.length - 2 && <> and </>}
                                </span>
                              ),
                            )}
                          </p>
                        )}

                        {item.AllowedAddOns.length > 0 && (
                          <p>
                            Allowed add on
                            {item.AllowedAddOns.length > 1 && <>s</>}
                            {": "}
                            {item.AllowedAddOns.map(
                              ({ Uid, Name }, index, array) => (
                                <span key={Uid}>
                                  <strong key={Uid}>{Name}</strong>
                                  {index < array.length - 2 && <>, </>}
                                  {index === array.length - 2 && <> and </>}
                                </span>
                              ),
                            )}
                          </p>
                        )}

                        {item.AllowedPlans.length === 0 &&
                          item.AllowedAddOns.length === 0 && (
                            <p>No allowed plans or add ons</p>
                          )}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {variant === "diconnected" && (
        <section>
          <Alert level="info">None of your pages are protected (yet).</Alert>
        </section>
      )}

      {variant === "no-content-groups" && (
        <section>
          <Alert level="warning">
            Add a{" "}
            <ExternalLink
              href={`https://${domain}/#/app/auth/nocode/content-groups`}
            >
              content group
            </ExternalLink>{" "}
            in Outseta to protect your pages.
          </Alert>
        </section>
      )}

      {variant === "no-matches" && (
        <section>
          <Alert level="warning">
            Add or edit a{" "}
            <ExternalLink
              href={`https://${domain}/#/app/auth/nocode/content-groups`}
            >
              content group
            </ExternalLink>{" "}
            in Outseta to protect your pages.
          </Alert>
        </section>
      )}
    </>
  );
}
