export type ParsedOutsetaScript = {
  domainExpression?: string;
  authCallbackExpression?: string;
  postSignupPath?: string;
};

export const parseOutsetaScript = (code: string): ParsedOutsetaScript => {
  // Captures the full expression after domain
  const domainRegex = /domain:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Captures the full expression after authenticationCallbackUrl
  const authCallbackUrlRegex =
    /authenticationCallbackUrl:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  const postRegistrationRegex = /postRegistrationUrl:\s*['"]([^'"]*)['"]/;

  const domainMatch = code.match(domainRegex);
  const authCallbackUrlMatch = code.match(authCallbackUrlRegex);
  const postSignupPathMatch = code.match(postRegistrationRegex);

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
    postSignupPath: postSignupPathMatch ? postSignupPathMatch[1] : undefined,
  };
};

export type CreateOutsetaScriptOptions = {
  domainExpression: string;
  authCallbackExpression?: string;
  postSignupPath?: string;
};

export const createOutsetaScript = ({
  domainExpression,
  authCallbackExpression,
  postSignupPath,
}: CreateOutsetaScriptOptions): string => {
  return `
        <script>
          var o_options = {
            domain: ${domainExpression},
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              ${authCallbackExpression ? `// Override the Post Login URL configured in Outseta` : `// Use the Post Login URL configured in Outseta`}
              authenticationCallbackUrl: ${authCallbackExpression},

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
