<template>
  <v-dialog
    v-model="visible"
    max-width="500"
    :persistent="loading"
  >
    <template v-slot:activator="{ on }">
      <slot
        name="activator"
        :on="on"
      />
    </template>
    <v-card color="grey darken-3">
      <v-form
        v-model="valid"
        @submit.prevent="submit"
      >
        <v-card-title>
          Change API client name
        </v-card-title>
        <v-card-text class="pb-0">
          <v-text-field
            v-model="name"
            outlined
            counter="50"
            :counter-value="counter"
            :rules="rules"
            :readonly="loading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            :disabled="loading"
            @click="visible = false"
          >
            Close
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            :disabled="!valid"
            :loading="loading"
          >
            Change
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class ApiClientNameChangeDialog extends Vue {
    visible = false;
    valid = true;
    name = '';
    loading = false;

    rules = [
      (v: string) => v.trim().length <= 50 || 'Name is too long',
      (v: string) => v.trim().length > 0 || 'Name is required',
    ];

    @Prop({ required: true, type: String })
    input!: string

    @Prop({
      type: Function,
      required: true,
    })
    renameApiClient!: (name: string) => Promise<void>

    counter (value: string) {
      return value.trim().length;
    }

    @Watch('visible', {
      immediate: true,
    })
    onVisibleChange (value: boolean) {
      if (value) {
        this.name = this.input;
      }
    }

    async submit () {
      if (!this.valid || this.loading) return;

      if (this.input === this.name.trim()) {
        this.visible = false;
        return;
      }

      this.loading = true;

      try {
        await this.renameApiClient(this.name.trim());
        this.visible = false;
      } catch (error) {
        console.error(error);
      }

      this.loading = false;
    }
  }
</script>
