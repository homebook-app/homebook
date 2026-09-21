import { financesModule } from '@homebook/module-finances';
import { kitchenModule } from '@homebook/module-kitchen';
import { platformInfoModule } from '@homebook/module-platform-info';
import type { HomeBookModule } from '@homebook/module-sdk';

export {
  createModuleRegistry,
  moduleRegistryKey,
  registerModules,
  useModuleRegistry,
  type ModuleRegistry,
  type ModuleStartMenuItem,
} from './registry';

/**
 * The modules of this build, imported statically. There is no runtime plugin loader: a new module
 * is a new package and one more entry here.
 */
export const modules: readonly HomeBookModule[] = [kitchenModule, financesModule, platformInfoModule];
