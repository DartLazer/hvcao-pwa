  <template>
    <div>
      <span v-for="segment in segments" :key="segment.key">
        <template v-if="segment.type === 'text'">
          {{ segment.content }}
        </template>
        <b v-else-if="segment.type === 'bold'">
          {{ segment.content }}
        </b>
        <i v-else-if="segment.type === 'italic'">
          {{ segment.content }}
        </i>
        <br v-else-if="segment.type === 'break'" />
        <NuxtLink v-else-if="segment.type === 'link'" :to="segment.href" class="link-secondary" rel="noopener noreferrer">
          {{ segment.content }}
        </NuxtLink>
        <span v-else-if="segment.type === 'questionLink'" class="link-secondary" @click="goToQuestion(segment.id)">
          {{ segment.content }}
        </span>
      </span>
    </div>
  </template>

  <script setup>
  import { ref, computed } from 'vue';
  import { useMainStore } from '~/store/mainStore';

  const store = useMainStore();
  const props = defineProps(['rawText']);

  const segments = computed(() => {
    let result = [];
    let remainingText = props.rawText;
    let textMatch;

    while (remainingText.length) {
      let match;

      // Bold
      if ((match = remainingText.match(/^\*\*(.*?)\*\*/))) {
        result.push({ type: 'bold', content: match[1] });
      }
      // Italic
      else if ((match = remainingText.match(/^\*(.*?)\*/))) {
        result.push({ type: 'italic', content: match[1] });
      }
      // Line breaks
      else if ((match = remainingText.match(/^(\n+)/))) {
        match[1].split('').forEach(() => result.push({ type: 'break' }));
      }
      // Links
      else if ((match = remainingText.match(/^\[(.*?)\]\((.*?)\)/))) {
        result.push({ type: 'link', content: match[1], href: match[2] });
      }
      // Question Links
      else if ((match = remainingText.match(/^\[\[(.*?)\|(.*?)\]\]/))) {
        result.push({ type: 'questionLink', content: match[2], id: match[1] });
      }
      // Text
      else {
        textMatch = remainingText.match(/^[^\*\n\[]+/) || [remainingText];
        result.push({ type: 'text', content: textMatch[0] });
      }

      remainingText = remainingText.substring((match || textMatch)[0].length);
    }

    return result;
  });



  const goToQuestion = (id) => {
    store.goToQuestionIDNow(id); // Here, the store method is directly invoked.
  }
  </script>
