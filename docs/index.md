# Hello VitePress

## Testing code mirror


<div id="code-mirror" class="bg-gray-300 dark:bg-gray-600"></div>


<script setup>
  import {  onMounted } from 'vue'

  import {EditorState} from "@codemirror/state"
  import {EditorView, keymap, lineNumbers, gutter } from "@codemirror/view"
  import {defaultKeymap} from "@codemirror/commands"

  let startState = EditorState.create({
    doc: "Hello World",
    extensions: [keymap.of(defaultKeymap), lineNumbers(), gutter({class: "cm-mygutter"})]
  })
  
  onMounted(() => {
    setTimeout(initCodeMirror, 200)
  })

  const initCodeMirror = () => {
    const el = document.getElementById('code-mirror')
    let view = new EditorView({
      state: startState,
      parent: el
    })
  }
</script>

<style lang="scss">

  .cm-gutters {
    @apply bg-gray-300 dark:bg-gray-500 pr-1;
  }

  .cm-gutterElement {
    @apply text-gray-400;
  }
</style>