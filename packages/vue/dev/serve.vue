<script lang="ts">
import { JsonSchema } from '@jsonforms/core';
import Vue from 'vue';
import {
  JsonForms,
  JsonFormsChangeEvent,
  VueRendererRegistryEntry
} from '../src';
import { entry as controlEntry } from './ControlRenderer.vue';
import { entry as layoutEntry } from './LayoutRenderer.vue';

export default Vue.extend<
  { renderers: VueRendererRegistryEntry[]; data: any; schema: JsonSchema },
  unknown,
  unknown,
  unknown
>({
  name: 'ServeDev',
  components: {
    JsonForms
  },
  data: function() {
    return {
      renderers: [controlEntry, layoutEntry],
      data: {
        number: 5
      },
      schema: {
        properties: {
          number: {
            type: 'number'
          }
        }
      }
    };
  },
  methods: {
    setSchema() {
      this.schema = {
        properties: {
          name: {
            type: 'string'
          }
        }
      };
    },
    onChange(event: JsonFormsChangeEvent) {
      console.log(event);
      this.data = event.data;
    }
  }
});
</script>

<template>
  <div id="app">
    <json-forms
      v-bind:data="data"
      v-bind:renderers="renderers"
      v-bind:schema="schema"
      @change="onChange"
    />
    <button @click="setSchema">Set Schema</button>
  </div>
</template>
