import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react-hooks/set-state-in-effect": "off", // Legitimate patterns in game: localStorage init, route sync, form reset
    },
  },
];
