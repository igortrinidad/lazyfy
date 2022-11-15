# Hello VitePress

## Testing code mirror


<div id="code-mirror">

</div>



<script setup>
  import {  onMounted } from 'vue'

  import {EditorState} from "@codemirror/state"
  import {EditorView, keymap} from "@codemirror/view"
  import {defaultKeymap} from "@codemirror/commands"

  let startState = EditorState.create({
    doc: "Hello World",
    extensions: [keymap.of(defaultKeymap)]
  })
  
  onMounted(() => {

    setTimeout(() => {
      const el = document.getElementById('code-mirror')
    
      console.log(el)
    
      let view = new EditorView({
        state: startState,
        parent: el
      })
    }, 2000)

  })
</script>