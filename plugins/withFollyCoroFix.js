const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = '# FOLLY_CORO_FIX_INJECTED';

const INJECTION = `
    ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        defs = build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS']
        defs = [defs] unless defs.is_a?(Array)
        unless defs.any? { |d| d.to_s.include?('FOLLY_CFG_NO_COROUTINES') }
          defs << 'FOLLY_CFG_NO_COROUTINES=1'
        end
        build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs
      end
    end
`;

function findMatchingEnd(src, openIdx) {
  const tokens = /\b(do|def|if|unless|case|begin|class|module|while|until|for|end)\b/g;
  tokens.lastIndex = openIdx;
  let depth = 1;
  let m;
  while ((m = tokens.exec(src)) !== null) {
    if (m[1] === 'end') {
      depth -= 1;
      if (depth === 0) return m.index;
    } else {
      depth += 1;
    }
  }
  return -1;
}

module.exports = function withFollyCoroFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const podfilePath = path.join(
        modConfig.modRequest.platformProjectRoot,
        'Podfile'
      );
      if (!fs.existsSync(podfilePath)) {
        return modConfig;
      }
      let contents = fs.readFileSync(podfilePath, 'utf8');
      if (contents.includes(MARKER)) {
        return modConfig;
      }

      const headerRegex = /post_install\s+do\s*\|installer\|\s*\n/;
      const headerMatch = contents.match(headerRegex);

      if (headerMatch) {
        const headerEnd = headerMatch.index + headerMatch[0].length;
        const matchingEndIdx = findMatchingEnd(contents, headerEnd);
        if (matchingEndIdx === -1) {
          throw new Error(
            'withFollyCoroFix: could not find matching `end` for post_install block in Podfile'
          );
        }
        contents = contents.slice(0, matchingEndIdx) + INJECTION + '  ' + contents.slice(matchingEndIdx);
      } else {
        const newBlock = `\n\npost_install do |installer|${INJECTION}end\n`;
        contents = contents + newBlock;
      }

      fs.writeFileSync(podfilePath, contents);
      return modConfig;
    },
  ]);
};
