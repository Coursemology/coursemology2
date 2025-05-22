'use strict';

const { builtinRules } = require('eslint/use-at-your-own-risk');
const baseRule = builtinRules.get('max-lines-per-function');

function isPascalCase(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function isPascalCaseNamedFunctionExpression(node) {
  return (
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  ) && node.parent?.type === 'VariableDeclarator' &&
     node.parent.id?.type === 'Identifier' &&
     isPascalCase(node.parent.id.name);
}

module.exports = {
  rules: {
    'max-lines-per-function': {
      meta: baseRule.meta,
      create(context) {
        const baseVisitor = baseRule.create(context);

        return {
          FunctionExpression(node) {
            if (isPascalCaseNamedFunctionExpression(node)) return;
            return baseVisitor.FunctionExpression?.(node);
          },
          ArrowFunctionExpression(node) {
            if (isPascalCaseNamedFunctionExpression(node)) return;
            return baseVisitor.ArrowFunctionExpression?.(node);
          },
          FunctionDeclaration: baseVisitor.FunctionDeclaration,
        };
      }
    }
  }
};

