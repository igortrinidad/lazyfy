# Lazyfy

### “I choose a lazy person to do a hard job. Because a lazy person will find an easy way to do it.” - Bill Gates

## Live examples


<div 
  class="w-full mb-4"
  v-for="example in examples"
  :key="example.id"
>
  ## {{ example.title }}

  <CodeMirror :example="example" />
</div>

<script setup>
  import { ref, computed } from 'vue'
  import CodeMirror from './components/CodeMirror.vue'
  import { arrayFindExamples } from './examples/array_find'

  const examples = computed(() => {
    return arrayFindExamples
  })

</script>

<style lang="scss">

  .cm-gutters {
    @apply bg-gray-300 dark:bg-gray-500 pr-1;
  }

  .cm-gutterElement {
    @apply text-gray-400;
  }
</style>