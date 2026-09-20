// Side-effect entry: `import '@homebook/ui/styles'` pulls in the fonts and the global stylesheet.
//
// Roboto is bundled, a self-hosted app must not depend on fonts.googleapis.com. Only the latin and
// latin-ext subsets: the weight-only entries (`400.css`) would ship all seven subsets.
import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import '@fontsource/roboto/latin-ext-300.css';
import '@fontsource/roboto/latin-ext-400.css';
import '@fontsource/roboto/latin-ext-500.css';
import '@fontsource/roboto/latin-ext-700.css';

import './index.scss';
