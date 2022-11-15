# Lazyfy

### “I choose a lazy person to do a hard job. Because a lazy person will find an easy way to do it.” - Bill Gates

## Testing code mirror


<div id="code-mirror" class="bg-gray-300 dark:bg-gray-600"></div>

<div  class="w-full flex justify-end">
  <button @click="run()" class="px-4 py-2 flex items-center justify-center bg-sky-700">
    RUN
  </button>
</div>

<div class="mt-4 border p-4">
  <pre>{{ result }}</pre>
</div>


<script setup>
  import {  ref, onMounted } from 'vue'

  import {EditorState} from "@codemirror/state"
  import {EditorView, keymap, lineNumbers, gutter } from "@codemirror/view"
  import {defaultKeymap} from "@codemirror/commands"

  let initialState = `return 4;`
  const result = ref('')

  let startState = EditorState.create({
    doc: initialState,
    extensions: [
      keymap.of(defaultKeymap), 
      lineNumbers(), 
      gutter({class: "cm-mygutter"}),
      EditorView.updateListener.of((e) => {
        initialState = e.state.doc.toString()
      })
    ]
  })
  
  onMounted(() => {
    setTimeout(initCodeMirror, 200)
  })

  let view

  const initCodeMirror = () => {
    const el = document.getElementById('code-mirror')
    view = new EditorView({
      state: startState,
      parent: el
    })

    run()
  }

  const run = () => {
    try {
      const newFn = new Function(initialState)
      const r = newFn()
      result.value = r
    } catch (err) {
      result.value = err.message
    }
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