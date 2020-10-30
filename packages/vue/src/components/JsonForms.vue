<template>
  <dispatch-renderer
    v-bind:schema="jsonforms.core.schema"
    v-bind:uischema="jsonforms.core.uischema"
    v-bind:path="''"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import {
  coreReducer,
  Actions,
  Generate,
  CoreActions,
  configReducer,
  JsonSchema,
  UISchemaElement,
  ValidationMode,
  JsonFormsCore,
  JsonFormsUISchemaRegistryEntry
} from '@jsonforms/core';
import {
  JsonFormsChangeEvent,
  JsonFormsVueState,
  VueCellRegistryEntry,
  VueRendererRegistryEntry
} from '../types';
import DispatchRenderer from './DispatchRenderer.vue';

import AJV from 'ajv';
import RefParser from 'json-schema-ref-parser';

interface JsonFormsData extends JsonFormsVueState {
  schemaToUse: JsonSchema;
  uischemaToUse: UISchemaElement;
}

interface JsonFormsProps {
  data: any;
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  renderers: VueRendererRegistryEntry[];
  cells?: VueCellRegistryEntry[];
  config?: any;
  readonly?: boolean;
  uischemas: JsonFormsUISchemaRegistryEntry[];
  validationMode?: ValidationMode;
  ajv?: AJV.Ajv;
  refParserOptions?: RefParser.Options;
}

interface JsonFormsMethods {
  dispatch: (action: CoreActions) => void;
}

export default Vue.extend<
  JsonFormsData,
  JsonFormsMethods,
  unknown,
  JsonFormsProps
>({
  name: 'JsonForms',
  components: {
    DispatchRenderer
  },
  props: {
    data: {
      required: true
    },
    schema: {
      required: false
    },
    uischema: {
      required: false
    },
    renderers: {
      required: true
    },
    cells: {
      required: false,
      default: () => []
    },
    config: {
      required: false
    },
    readonly: {
      required: false,
      default: false
    },
    uischemas: {
      required: false,
      default: () => []
    },
    validationMode: {
      required: false,
      default: 'ValidateAndShow'
    },
    ajv: {
      required: false
    },
    refParserOptions: {
      required: false
    }
  },
  data() {
    const schemaToUse = this.schema ?? Generate.jsonSchema(this.data);
    const uischemaToUse = this.uischema ?? Generate.uiSchema(schemaToUse);
    const initCore = (): JsonFormsCore => {
      const initialCore = {
        data: this.data,
        schema: schemaToUse,
        uischema: uischemaToUse
      };
      const core = coreReducer(
        initialCore,
        Actions.init(this.data, schemaToUse, uischemaToUse, {
          validationMode: this.validationMode,
          ajv: this.ajv,
          refParserOptions: this.refParserOptions
        })
      );
      return core;
    };
    return {
      schemaToUse,
      uischemaToUse,
      jsonforms: {
        core: initCore(),
        config: configReducer(undefined, Actions.setConfig(this.config)),
        renderers: this.renderers,
        cells: this.cells,
        uischemas: this.uischemas,
        readonly: this.readonly
      }
    };
  },
  watch: {
    schema(newSchema) {
      this.schemaToUse = newSchema ?? Generate.jsonSchema(this.data);
      if (!this.uischema) {
        this.uischemaToUse = Generate.uiSchema(this.schemaToUse);
      }
    },
    uischema(newUischema) {
      this.uischemaToUse = newUischema ?? Generate.uiSchema(this.schemaToUse);
    },
    renderers(newRenderers) {
      this.jsonforms.renderers = newRenderers;
    },
    cells(newCells) {
      this.jsonforms.cells = newCells;
    },
    uischemas(newUischemas) {
      this.jsonforms.uischemas = newUischemas;
    },
    config(newConfig) {
      this.jsonforms.config = configReducer(
        undefined,
        Actions.setConfig(newConfig)
      );
    },
    readonly(newReadonly) {
      this.jsonforms.readonly = newReadonly;
    }
  },
  computed: {
    dataAndErrors() {
      return {
        data: this.jsonforms.core.data,
        errors: this.jsonforms.core.errors
      };
    }
  },
  mounted() {
    this.$watch(
      // @ts-ignore - valid although types don't allow it
      vm => [vm.data, vm.schemaToUse, vm.uischemaToUse, vm.validationMode],
      function() {
        this.jsonforms.core = coreReducer(
          this.jsonforms.core,
          Actions.updateCore(this.data, this.schemaToUse, this.uischemaToUse, {
            validationMode: this.validationMode,
            ajv: this.ajv,
            refParserOptions: this.refParserOptions
          })
        );
      }
    );
    const emitChange = () => {
      const event: JsonFormsChangeEvent = {
        data: this.jsonforms.core.data,
        errors: this.jsonforms.core.errors
      };
      this.$emit('change', event);
    };
    this.$watch(
      // @ts-ignore - valid although types don't allow it
      vm => [vm.jsonforms.core.data, vm.jsonforms.core.errors],
      function() {
        emitChange();
      }
    );
    // emit an inital change so clients can react to error validation and default data insertion
    emitChange();
  },
  methods: {
    dispatch(action) {
      this.jsonforms.core = coreReducer(this.jsonforms.core, action);
    }
  },
  provide() {
    return {
      jsonforms: this.jsonforms,
      dispatch: this.dispatch
    };
  }
});
</script>
