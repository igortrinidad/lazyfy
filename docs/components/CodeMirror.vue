
<template>

  <div class="w-full flex flex-col">
    <div :id="id" class="bg-gray-300 dark:bg-gray-600"></div>
    <div class="mt-4 border border-zinc-300 dark:border-zinc-700/70 p-4 pt-8 relative">
      <span class="absolute top-0 left-0 mt-2 ml-2 text-gray-400">result:</span>
      <pre>{{ resultCode }}</pre>
    </div>

  </div>

</template>

<script setup>
  import { ArrayHelpers, StringHelpers } from '../../src'
  import {  ref, onMounted } from 'vue'
  import { EditorState } from "@codemirror/state"
  import { EditorView, keymap, lineNumbers, gutter } from "@codemirror/view"
  import {javascript} from "@codemirror/lang-javascript"
  import { materialDark } from 'cm6-theme-material-dark'
  import { defaultKeymap } from "@codemirror/commands"

  const props = defineProps({
    example: Object
  })

  console.log(ArrayHelpers, StringHelpers)

  const resultCode = ref('')
  const id = ref('')
  let currentCode = ''
  let running = null

  onMounted(() => {
    const idStatic = StringHelpers.randomString(32)
    id.value = idStatic
    currentCode = props.example.code
    setTimeout(initCodeMirror, 300)
  })

  const initCodeMirror = () => {

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
          }, 600)
        })
      ]
    })

    const el = document.getElementById(id.value)
    
    if(!el) throw new Error(`Element id ${id.value} not found, please inspect what's wrong.`)

    const view = new EditorView({
      state: startState,
      parent: el
    })

    run()
  }

  const run = () => {
    try {
      console.log(StringHelpers.randomString(32))
      let result
      eval(currentCode)
      highlightCode(result)
    } catch (err) {
      highlightCode(err.message)
    }
  }

  const highlightCode = (result) => {
    resultCode.value = result
  }

  const guaranteeScope = () => {
    return { ArrayHelpers, StringHelpers }
  }

</script>

<style lang="scss">


</style>
