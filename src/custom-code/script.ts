export const parseOutsetaScript = (code: string) => {
  const domainRegex = /domain: '(.+?)'/;
  const authCallbackUrlRegex =
    /authenticationCallbackUrl:\s*(['"]?)([^,\n'"]+?)\1(?:,|\n)/;
  const postRegistrationRegex = /postRegistrationUrl:\s*"([^"]*)"/;

  const domainMatch = code.match(domainRegex);
  const authCallbackUrlMatch = code.match(authCallbackUrlRegex);
  const postSignupPathMatch = code.match(postRegistrationRegex);

  return {
    domain: domainMatch ? domainMatch[1] : undefined,
    authCallbackUrl: authCallbackUrlMatch
      ? authCallbackUrlMatch[2].trim()
      : undefined,
    postSignupPath: postSignupPathMatch ? postSignupPathMatch[1] : undefined,
  };
};

export const createOutsetaScript = ({
  domain,
  authCallbackUrl,
  postSignupPath,
}: {
  domain: string;
  authCallbackUrl?: string;
  postSignupPath?: string;
}) => {
  return `
        <script>
          var o_options = {
            domain: '${domain}',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              ${authCallbackUrl ? `// Override the Post Login URL configured in Outseta` : `// Use the Post Login URL configured in Outseta`}
              authenticationCallbackUrl: ${authCallbackUrl},

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
