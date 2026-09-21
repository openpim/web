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

        <div class="copy-dialog__targets">
          <v-treeview
            v-if="treeItems.length"
            v-model="selectedKeys"
            :items="treeItems"
            :search="search"
            :filter="filterItem"
            :open.sync="openKeys"
            item-disabled="disabled"
            selectable
            selection-type="leaf"
            dense
            hoverable
            selected-color="primary"
          />
          <div v-else class="copy-dialog__empty">
            {{ $t('MappingConfigComponent.CopyAttribute.NoTargets') }}
          </div>
        </div>

        <v-alert v-if="selectedKeys.length" class="mt-3" dense type="warning" text>
          {{ $t('MappingConfigComponent.CopyAttribute.Summary', { overwrite: overwriteCount, insert: insertCount }) }}
        </v-alert>

        <v-alert v-if="incompatibleTargets.length" class="mt-3" dense type="info" text>
          <div>{{ $t('MappingConfigComponent.CopyAttribute.Incompatible') }}</div>
          <div class="copy-dialog__incompatible">
            {{ incompatibleLabels }}
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
      selectedKeys: [],
      openKeys: []
    }
  },
  computed: {
    compatibleTargets () {
      return this.targets.filter(target => target.mode !== 'skip')
    },
    incompatibleTargets () {
      return this.targets.filter(target => target.mode === 'skip')
    },
    incompatibleLabels () {
      return this.incompatibleTargets.map(target => `${target.channelLabel} → ${target.label}`).join(', ')
    },
    treeItems () {
      const groups = []
      const groupsById = new Map()
      for (const target of this.targets) {
        let group = groupsById.get(target.channelId)
        if (!group) {
          group = { id: this.channelNodeId(target.channelId), name: target.channelLabel, children: [] }
          groupsById.set(target.channelId, group)
          groups.push(group)
        }
        group.children.push({
          id: target.id,
          name: target.label,
          disabled: target.mode === 'skip'
        })
      }
      return groups
    },
    selectedTargets () {
      return this.compatibleTargets.filter(target => this.selectedKeys.includes(target.id))
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
        this.openKeys = []
      }
    }
  },
  methods: {
    channelNodeId (channelId) {
      return 'channel-' + channelId
    },
    filterItem (item, search, textKey) {
      const query = (search || '').trim().toLocaleLowerCase()
      if (!query) return true
      return (item[textKey] || '').toLocaleLowerCase().includes(query)
    },
    selectAll () {
      this.selectedKeys = this.compatibleTargets.map(target => target.id)
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

.copy-dialog__empty {
  padding: 12px 0;
  opacity: 0.6;
}

.copy-dialog__incompatible {
  margin-top: 4px;
  overflow-wrap: anywhere;
}
</style>
