import { ExternalLink } from "../common";
import { withForm } from "../forms";
import { customCodeFormOptions } from "./custom-code-form";

export const DomainFieldSection = withForm({
  ...customCodeFormOptions,
  render: function Render({ form }) {
    return (
      <fieldset>
        <form.AppField
          name="domain"
          children={(field) => (
            <>
              <field.TextField
                label="Outseta Domain"
                placeholder="your-domain.outseta.com"
              />

              <p>
                <ExternalLink href="https://outseta.com">Sign up</ExternalLink>{" "}
                for an account or{" "}
                <ExternalLink href="https://go.outseta.com/#/login">
                  login
                </ExternalLink>{" "}
                to your existing acount to find your domain.
              </p>
            </>
          )}
        />
      </fieldset>
    );
  },
});
