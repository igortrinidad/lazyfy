
<template>

  <div class="w-full flex flex-col">
    <div :id="example.id" class="bg-gray-300 dark:bg-gray-600"></div>

    <div class="mt-4 border p-4">
      <pre>{{ resultRef }}</pre>
    </div>
  </div>

</template>

<script setup>
  import { ArrayHelpers } from '../../src'
  import {  ref, onMounted } from 'vue'
  import { EditorState } from "@codemirror/state"
  import { EditorView, keymap, lineNumbers, gutter } from "@codemirror/view"
  import { defaultKeymap } from "@codemirror/commands"

  const props = defineProps({
    example: Object
  })
  
  let currentCode = props.example.code
  const resultRef = ref('')

  let running = null

  let startState = EditorState.create({
    doc: currentCode,
    extensions: [
      keymap.of(defaultKeymap), 
      lineNumbers(), 
      gutter({class: "cm-mygutter"}),
      EditorView.updateListener.of((e) => {
        currentCode = e.state.doc.toString()
        if(running) clearTimeout(running)
        running = setTimeout(() => {
          run()
        }, 1000)
      })
    ]
  })
  
  onMounted(() => {
    currentCode = props.example
    setTimeout(initCodeMirror, 200)
  })

  let view
  const initCodeMirror = () => {
    const el = document.getElementById(props.example.id)
    view = new EditorView({
      state: startState,
      parent: el
    })
    run()
  }

  const run = () => {
    try {
      let result
      eval(currentCode)
      resultRef.value = result
    } catch (err) {
      resultRef.value = err.message
    }
  }

</script>

<style lang="scss">

  .cm-line {
    @apply pl-3;
  }

  .cm-gutters {
    @apply bg-gray-300 dark:bg-gray-500 pr-1;
  }

  .cm-gutterElement {
    @apply text-gray-400;
  }
</style>
