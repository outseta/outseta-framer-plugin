export type OutsetaScriptOptions = {
  domainExpression?: string;
  authCallbackExpression?: string;
  // When null, omit the entire line. When undefined or a string, include the line as-is.
  postSignupExpression?: string | null;
};

export const parseOutsetaScript = (code: string): OutsetaScriptOptions => {
  // Captures the full expression after domain
  const domainRegex = /domain:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Captures the full expression after authenticationCallbackUrl
  const authCallbackUrlRegex =
    /authenticationCallbackUrl:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Capture the full expression after postRegistrationUrl (quoted, undefined, or new URL(...).href)
  const postRegistrationRegex =
    /postRegistrationUrl:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;

  const domainMatch = code.match(domainRegex);
  const authCallbackUrlMatch = code.match(authCallbackUrlRegex);
  const postSignupExpressionMatch = code.match(postRegistrationRegex);

  // Extract and validate domain
  let domainExpression = undefined;
  if (domainMatch) {
    const captured = domainMatch[1].trim();
    // Check if it starts with a quote and ensure it has a matching closing quote
    if (
      (captured.startsWith('"') && captured.endsWith('"')) ||
      (captured.startsWith("'") && captured.endsWith("'"))
    ) {
      domainExpression = captured;
    } else if (!captured.startsWith('"') && !captured.startsWith("'")) {
      // It's an unquoted expression
      domainExpression = captured;
    }
    // Otherwise it's malformed (unclosed quote), so leave it as undefined
  }

  // Extract and validate authCallbackExpression
  let authCallbackExpression = undefined;
  if (authCallbackUrlMatch) {
    const captured = authCallbackUrlMatch[1].trim();
    // Check if it starts with a quote and ensure it has a matching closing quote
    if (
      (captured.startsWith('"') && captured.endsWith('"')) ||
      (captured.startsWith("'") && captured.endsWith("'"))
    ) {
      authCallbackExpression = captured;
    } else if (!captured.startsWith('"') && !captured.startsWith("'")) {
      // It's an unquoted expression
      authCallbackExpression = captured;
    }
    // Otherwise it's malformed (unclosed quote), so leave it as undefined
  }

  return {
    domainExpression,
    authCallbackExpression,
    postSignupExpression: postSignupExpressionMatch
      ? postSignupExpressionMatch[1].trim()
      : undefined,
  };
};

export const createOutsetaScript = ({
  domainExpression,
  authCallbackExpression,
  postSignupExpression,
}: OutsetaScriptOptions & { domainExpression: string }): string => {
  const hasAuthCallback = Boolean(authCallbackExpression);
  const postSignupLine =
    postSignupExpression == null
      ? ""
      : `\n              // Override the Post Signup URL or signup embed's post signup message\n              postRegistrationUrl: ${postSignupExpression},`;
  return `
        <script>
          var o_options = {
            domain: ${domainExpression},
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              ${hasAuthCallback ? `// Override the Post Login URL configured in Outseta` : `// Use the Post Login URL configured in Outseta`}
              authenticationCallbackUrl: ${authCallbackExpression},

              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,
              ${postSignupLine}
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
