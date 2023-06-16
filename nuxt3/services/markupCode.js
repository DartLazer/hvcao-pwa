import DOMPurify from 'dompurify';

export const markupText = function (text) {
    if (!text) return "";
    let newText = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    newText = newText.replace(/\*(.*?)\*/g, "<i>$1</i>");
    newText = newText.replace(/\n/g, "<br>");
    return DOMPurify.sanitize(newText);
};
