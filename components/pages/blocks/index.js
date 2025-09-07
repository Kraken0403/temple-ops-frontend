// components/pages/blocks/index.js
import RichTextBlock from './RichTextBlock.vue'
import ImageBlock     from './ImageBlock.vue'
import ButtonBlock    from './ButtonBlock.vue'

export const BLOCKS = {
  paragraph: RichTextBlock,
  image:     ImageBlock,
  button:    ButtonBlock
}
