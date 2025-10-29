export const expressionToDomain = (expression: string = "") => {
  const customMatch = expression.match(/^["']([^"']+)["']$/);
  if (!customMatch) {
    // If empty string expression for instance, return undefined
    return undefined;
  }
  return customMatch[1];
};

export const domainToExpression = (domain: string) => {
  return `'${domain}'`;
};
