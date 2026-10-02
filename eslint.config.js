// Arquivos de configuração da raiz. Cada app/pacote tem o seu próprio eslint.config.js.
import { base } from "@guara/eslint-config/base";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([globalIgnores(["apps/**", "packages/**"]), base]);
