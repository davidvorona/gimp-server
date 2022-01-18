module.exports = {
    "extends": "eslint:recommended",
    "parser": "@babel/eslint-parser",
    "parserOptions": {
        "ecmaVersion": 2017,
        "requireConfigFile": false
    },
    "env": {
        "es6": true,
        "node": true
    },
    "rules": {
        // add custom rules here
        // https://eslint.org/docs/rules/
        "indent": ["error", 4, {
            "MemberExpression": 1,
            "SwitchCase": 1
        }], // use 4 spaces
        "quotes": ["error", "double"], // use double quotes
        "no-plusplus":  ["error", { "allowForLoopAfterthoughts": true }],
        "quote-props": ["error", "consistent"],
        "arrow-parens": ["error", "as-needed", { "requireForBlockBody": true }],
        "semi": ["error", "always"],
        "max-len": ["error", { "code": 100, "ignoreUrls": true }]
    }
};
