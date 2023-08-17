import DOMPurify from 'dompurify';

export const markupText = function (text) {
    // This function marks up a string of text using predefined patters, so that they can be displayed accoridngly
    // in the bootstraps accordions on the app.
    if (!text) return "";

    let newText = text;

    // Bold
    newText = newText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    // Italic
    newText = newText.replace(/\*(.*?)\*/g, "<i>$1</i>");

    // Line breaks
    newText = newText.replace(/\n/g, "<br>");

    // Links
    newText = newText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Custom question links
    newText = newText.replace(/\[\[(.*?)\|(.*?)\]\]/g, '<a class="link-secondary" @click="goToQuestionID(\'$1\')">$2</a>');

    return DOMPurify.sanitize(newText);
};
