<template>
  <component
    v-bind:is="renderer"
    v-bind:schema="schema"
    v-bind:uischema="uischema"
    v-bind:path="path"
  ></component>
</template>

<script lang="ts">
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import Vue, { VueConstructor } from 'vue';
import UnknownRenderer from './UnknownRenderer.vue';
import type { InjectJsonFormsState, JsonFormsVueSubStates } from '../types';
import maxBy from 'lodash/maxBy';

interface DispatchRendererProps {
  schema: JsonSchema;
  uischema: UISchemaElement;
  path: string;
}

interface DispatchRendererComputed {
  renderer: VueConstructor<Vue>;
}

export default (Vue as VueConstructor<Vue & InjectJsonFormsState>).extend<unknown, unknown, DispatchRendererComputed, DispatchRendererProps>({
  name: 'DispatchRenderer',
  props: {
    schema: {
      required: true
    },
    uischema: {
      required: true
    },
    path: {
      required: true,
    }
  },
  inject: ['jsonforms'],
  computed: {
    renderer() {
      const renderer = maxBy((this.jsonforms as JsonFormsVueSubStates).renderers, r =>
        r.tester(this.uischema, this.schema)
      );
      if (
        renderer === undefined ||
        renderer.tester(this.uischema, this.schema) === -1
      ) {
        return UnknownRenderer;
      } else {
        return renderer.renderer;
      }
    }
  }
});
</script>
