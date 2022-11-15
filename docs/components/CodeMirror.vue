
<template>

  <div class="w-full flex flex-col">
    <div :id="example.id" class="bg-gray-300 dark:bg-gray-600"></div>

    <div class="mt-4 border p-4">
      <pre>{{ resultCode }}</pre>
    </div>

  </div>

</template>

<script setup>
  import { ArrayHelpers } from '../../src'
  import {  ref, onMounted } from 'vue'
  import { EditorState } from "@codemirror/state"
  import { EditorView, keymap, lineNumbers, gutter } from "@codemirror/view"
  import {javascript} from "@codemirror/lang-javascript"
  import { materialDark } from 'cm6-theme-material-dark'
  import { defaultKeymap } from "@codemirror/commands"

  const props = defineProps({
    example: Object
  })

  const resultCode = ref('')
  let currentCode = props.example.code
  let running = null

  let startState = EditorState.create({
    doc: currentCode,
    extensions: [
      javascript(),
      materialDark,
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
      console.log(this)
      eval(currentCode)({ ArrayHelpers })
      highlightCode(result)
    } catch (err) {
      highlightCode(err.message)
    }
  }

  const highlightCode = (result) => {
    resultCode.value = result
  }

</script>

<style lang="scss">


</style>
