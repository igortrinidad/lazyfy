<h1>Lazyfy</h1>

<h2>“I choose a lazy person to do a hard job. Because a lazy person will find an easy way to do it.” - Bill Gates</h2>

## Playground

Play around with the examples below. The code run 1s after changing the snippets.

<div 
  class="w-full mb-4"
  v-for="example in examples"
  :key="example.id"
>

  <h3 class="mb-2 pb-2" :id="example.id">{{ example.title }}</h3>

  <CodeMirror :example="example" />

</div>

<script setup>
  
  import { ref, computed } from 'vue'
  import CodeMirror from './components/CodeMirror.vue'
  import examplesSource from './examples'

  const examples = ref(examplesSource)

</script>