<template>
  <v-dialog :value="value" persistent max-width="760" @input="$emit('input', $event)">
    <v-card>
      <v-card-title>{{ $t('MappingConfigComponent.CopyAttribute.Title') }}</v-card-title>
      <v-card-subtitle class="copy-dialog__source">
        {{ $t('MappingConfigComponent.CopyAttribute.Source') }}: <strong>{{ sourceLabel }}</strong>
      </v-card-subtitle>

      <v-card-text>
        <v-text-field
          v-model="search"
          clearable
          dense
          hide-details
          :label="$t('Filter')"
        />

        <div class="copy-dialog__toolbar">
          <v-btn small text @click="selectAll">
            {{ $t('MappingConfigComponent.CopyAttribute.SelectAll') }}
          </v-btn>
        </div>

        <v-list class="copy-dialog__targets" dense>
          <v-list-item v-for="target in filteredTargets" :key="target.key">
            <v-checkbox
              dense
              hide-details
              :input-value="selectedKeys.includes(target.key)"
              :label="target.label"
              @change="toggleTarget(target.key, $event)"
            />
          </v-list-item>
        </v-list>

        <v-alert v-if="selectedKeys.length" class="mt-3" dense type="warning" text>
          {{ $t('MappingConfigComponent.CopyAttribute.Summary', { overwrite: overwriteCount, insert: insertCount }) }}
        </v-alert>

        <v-alert v-if="incompatibleTargets.length" class="mt-3" dense type="info" text>
          <div>{{ $t('MappingConfigComponent.CopyAttribute.Incompatible') }}</div>
          <div class="copy-dialog__incompatible">
            {{ incompatibleTargets.map(target => target.label).join(', ') }}
          </div>
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('input', false)">{{ $t('Cancel') }}</v-btn>
        <v-btn color="primary" :disabled="selectedKeys.length === 0" @click="confirmCopy">
          {{ $t('MappingConfigComponent.CopyAttribute.Confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: { type: Boolean, required: true },
    sourceLabel: { type: String, default: '' },
    targets: { type: Array, default: () => [] }
  },
  data () {
    return {
      search: '',
      selectedKeys: []
    }
  },
  computed: {
    compatibleTargets () {
      return this.targets.filter(target => target.mode !== 'skip')
    },
    incompatibleTargets () {
      return this.targets.filter(target => target.mode === 'skip')
    },
    filteredTargets () {
      const query = this.search.trim().toLocaleLowerCase()
      if (!query) return this.compatibleTargets
      return this.compatibleTargets.filter(target => target.label.toLocaleLowerCase().includes(query))
    },
    selectedTargets () {
      return this.compatibleTargets.filter(target => this.selectedKeys.includes(target.key))
    },
    overwriteCount () {
      return this.selectedTargets.filter(target => target.mode === 'overwrite').length
    },
    insertCount () {
      return this.selectedTargets.filter(target => target.mode === 'insert').length
    }
  },
  watch: {
    value (open) {
      if (open) {
        this.search = ''
        this.selectedKeys = []
      }
    }
  },
  methods: {
    toggleTarget (key, selected) {
      if (selected && !this.selectedKeys.includes(key)) this.selectedKeys = [...this.selectedKeys, key]
      if (!selected) this.selectedKeys = this.selectedKeys.filter(value => value !== key)
    },
    selectAll () {
      this.selectedKeys = this.compatibleTargets.map(target => target.key)
    },
    confirmCopy () {
      if (this.selectedKeys.length === 0) return
      this.$emit('confirm', [...this.selectedKeys])
      this.$emit('input', false)
    }
  }
}
</script>

<style scoped>
.copy-dialog__source {
  white-space: normal;
}

.copy-dialog__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.copy-dialog__targets {
  max-height: 320px;
  overflow-y: auto;
}

.copy-dialog__incompatible {
  margin-top: 4px;
  overflow-wrap: anywhere;
}
</style>
