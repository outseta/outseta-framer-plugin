export type OutsetaScriptOptions = {
  domainExpression: string;
  authCallbackExpression: string;
  // When null, omit the entire line. When undefined or a string, include the line as-is.
  postSignupExpression: string;
};

export const parseOutsetaScript = (code: string): OutsetaScriptOptions => {
  // Captures the full expression after domain
  const domainRegex = /domain:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Captures the full expression after authenticationCallbackUrl
  const authCallbackUrlRegex =
    /authenticationCallbackUrl:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Capture the full expression after postRegistrationUrl
  const postRegistrationRegex =
    /postRegistrationUrl:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;

  const domainMatch = code.match(domainRegex);
  const authCallbackUrlMatch = code.match(authCallbackUrlRegex);
  const postSignupExpressionMatch = code.match(postRegistrationRegex);

  return {
    domainExpression: domainMatch ? domainMatch[1].trim() : "",
    authCallbackExpression: authCallbackUrlMatch
      ? authCallbackUrlMatch[1].trim()
      : "",
    postSignupExpression: postSignupExpressionMatch
      ? postSignupExpressionMatch[1].trim()
      : "",
  };
};

export const createOutsetaScript = ({
  domainExpression,
  authCallbackExpression,
  postSignupExpression,
}: OutsetaScriptOptions): string => {
  return `
        <script>
          var o_options = {
            domain: ${domainExpression},
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              ${authCallbackExpression === undefined ? `// Override the Post Login URL configured in Outseta` : `// Use the Post Login URL configured in Outseta`}
              authenticationCallbackUrl: ${authCallbackExpression},
              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,
              ${postSignupExpression === undefined ? `// Override the Post Signup URL configured in Outseta` : `// Use the Post Signup URL configured in Outseta`}
              postRegistrationUrl: ${postSignupExpression},
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
