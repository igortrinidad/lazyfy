# Lazyfy

### “I choose a lazy person to do a hard job. Because a lazy person will find an easy way to do it.” - Bill Gates

## Playground

Play around with the examples below. The code run 1s after changing the snippets.

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
  import examplesSource from './examples'

  const examples = ref(examplesSource)

</script>