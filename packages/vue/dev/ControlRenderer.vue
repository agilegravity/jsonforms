<template>
  <div>
    <div>Control renderer</div>
    <div>
      Schema:
      <pre>{{ JSON.stringify(schema, null, 2) }}</pre>
    </div>
    <div>
      UI Schema:
      <pre>{{ JSON.stringify(uischema) }}</pre>
    </div>
    <div>
      Path:
      <pre>{{ path }}</pre>
    </div>
    <div>
      Computed Props:
      <pre>{{ JSON.stringify(control, null, 2) }}</pre>
    </div>
    <input v-bind:value="control.data" @change="onChange" />
    <div class="error" v-if="control.errors">{{ control.errors }}</div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
pre {
  background-color: lightgray;
}
</style>

<script lang="ts">
import { isControl, rankWith } from '@jsonforms/core';
import Vue, { VueConstructor } from 'vue';
import { control, ControlMixin, VueRendererRegistryEntry } from '../src/';

interface TestControlMethods {
  onChange: (event: Event) => void;
}

const controlRenderer: VueConstructor = (Vue as VueConstructor<
  Vue & ControlMixin
>).extend<unknown, TestControlMethods, unknown, unknown>({
  name: 'ControlRenderer',
  mixins: [control],
  methods: {
    onChange(event: Event) {
      this.handleChange(
        this.control.path,
        (event.target as HTMLInputElement).value
      );
    }
  }
});

export default controlRenderer;

export const entry: VueRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(1, isControl)
};
</script>
