<script setup lang="ts">
import Accordion from 'primevue/accordion';
import AccordionContent from 'primevue/accordioncontent';
import AccordionHeader from 'primevue/accordionheader';
import AccordionPanel from 'primevue/accordionpanel';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import UiIcon from './UiIcon.vue';

export interface UiLicense {
  /** Package name. Spaces are encoded as `__`, the way the license files are named. */
  name: string;
  /** The license text as HTML, generated at build time from the dependency manifest. */
  htmlContent: string;
}

interface Props {
  visible: boolean;
  licenses?: UiLicense[];
  /** The setup wizard needs the accept button, the about page only shows the texts. */
  showAcceptButton?: boolean;
}

withDefaults(defineProps<Props>(), { licenses: () => [], showAcceptButton: true });

const emit = defineEmits<{
  'update:visible': [value: boolean];
  canceled: [];
  accepted: [];
}>();

const { t } = useI18n();

const openPanels = ref<string[]>([]);

function displayName(license: UiLicense): string {
  return license.name.replaceAll('__', ' ');
}

function cancel(): void {
  emit('canceled');
  emit('update:visible', false);
}

function accept(): void {
  emit('accepted');
  emit('update:visible', false);
}
</script>

<template>
  <Dialog
    class="ui-license-dialog"
    :visible="visible"
    modal
    :header="t('ui.licenseDialog.title')"
    @update:visible="emit('update:visible', $event)"
  >
    <Accordion v-model:value="openPanels" multiple>
      <AccordionPanel v-for="(license, index) in licenses" :key="license.name" :value="String(index)">
        <AccordionHeader>{{ displayName(license) }}</AccordionHeader>
        <AccordionContent>
          <!-- Generated at build time from the dependency manifest and bundled with the app, the
               same trust level as this template. It never comes from the API or from a user, and
               sanitising it would mangle the markup the license texts rely on. -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <article class="ui-license-dialog-text" v-html="license.htmlContent"></article>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <template #footer>
      <Button severity="secondary" :label="t('ui.licenseDialog.close')" @click="cancel">
        <template #icon>
          <UiIcon set="windows11-filled" name="Close" size="small" />
        </template>
      </Button>

      <Button v-if="showAcceptButton" :label="t('ui.licenseDialog.acceptContinue')" @click="accept">
        <template #icon>
          <UiIcon set="windows11-filled" name="Check" size="small" />
        </template>
      </Button>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
.ui-license-dialog-text {
  // License texts are preformatted and often wider than the dialog
  overflow-x: auto;
}
</style>
