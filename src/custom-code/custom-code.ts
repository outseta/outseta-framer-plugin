import { framer } from "framer-plugin";

export const setCustomCode = async ({
  domain,
  postLoginPath,
  postSignupPath,
}: {
  domain: string | null;
  postLoginPath?: string;
  postSignupPath?: string;
}) => {
  if (!domain) {
    return await framer.setCustomCode({ html: null, location: "headEnd" });
  } else {
    domain = domain?.trim();
    domain = domain.replace(/https?:\/\//, "");
    return await framer.setCustomCode({
      html: createCustomCode({ domain, postLoginPath, postSignupPath }),
      location: "headEnd",
    });
  }
};

export const subscribeToCustomCode = (
  callback: (props: {
    domain: string;
    postLoginPath: string;
    postSignupPath: string;
    disabled: boolean;
  }) => void,
) => {
  return framer.subscribeToCustomCode(({ headEnd }) => {
    const customCodeOptions = extractOptionsFromCode(headEnd.html || "");
    const disabled = headEnd.disabled || false;
    callback({ ...customCodeOptions, disabled });
  });
};

const extractOptionsFromCode = (code: string) => {
  const domainRegex = /domain: '(.+?)'/;
  const authCallbackRegex = /authenticationCallbackUrl:\s*"([^"]*)"/;
  const postRegistrationRegex = /postRegistrationUrl:\s*"([^"]*)"/;

  const domainMatch = code.match(domainRegex);
  const postLoginPathMatch = code.match(authCallbackRegex);
  const postSignupPathMatch = code.match(postRegistrationRegex);

  return {
    domain: domainMatch ? domainMatch[1] : "",
    postLoginPath: postLoginPathMatch ? postLoginPathMatch[1] : "",
    postSignupPath: postSignupPathMatch ? postSignupPathMatch[1] : "",
  };
};

const createCustomCode = ({
  domain,
  postLoginPath,
  postSignupPath,
}: {
  domain: string;
  postLoginPath?: string;
  postSignupPath?: string;
}) => {
  return `
        <script>
          var o_options = {
            domain: '${domain}',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              // Overrides the Post Login URL or uses the current page
              authenticationCallbackUrl: "${postLoginPath || ``}" ? new URL("${postLoginPath || ``}", window.location.origin).href : window.location.href,
              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,
              // Override the Post Signup URL or signup embed's post signup message
              postRegistrationUrl: "${postSignupPath || ``}" ? new URL("${postSignupPath || ``}", window.location.origin).href : undefined,
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `;
};
