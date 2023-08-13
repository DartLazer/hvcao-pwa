import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
    state: () => ({
        offlineQuestions: JSON.parse(localStorage.getItem('offlineQuestions')) || [],
        questionSubmittedAlert: { show: false, message: '' },
        questionDeletedAlert: { show: false, message: '' },
        offlineMessage: { show: false, message: "" },
        shouldRefresh: false,
        loadingAccordion: false,
        submittingQuestion: false,
        cleanFiltersAndSearchBar: false,
        goToQuestionID: null,
        pageTitle: 'Home',
    }),
    getters: {
        // Add any getters here...
    },
    actions: {
        addOfflineQuestion(question) {
            this.offlineQuestions.push(question);
            localStorage.setItem('offlineQuestions', JSON.stringify(this.offlineQuestions));
        },
        removeAllOfflineQuestions() {
            localStorage.removeItem('offlineQuestions');
            this.offlineQuestions= [];
        },
        showSuccessAlert(message) {
            this.questionSubmittedAlert = { show: true, message }
            setTimeout(() => {
                this.questionSubmittedAlert = { show: false, message: '' }
            }, 3000)
        },
        showErrorAlert(message) {
            this.questionDeletedAlert = { show: true, message }
            setTimeout(() => {
                this.questionDeletedAlert = { show: false, message: '' }
            }, 10000)
        },
        showAlert(alertType, message) {
            if (alertType === 'successAlert'){
                this.showSuccessAlert(message);
            } else{
                this.showErrorAlert(message);
            }
        },
        showOfflineMessage() {
            if (!navigator.onLine) {
                this.offlineMessage.message = 'U bent offline. ' +
                    'Opgeslagen berichten worden gesynschroniseerd met de server zodra er weer verbinding is.'
                this.offlineMessage.show = true
            } else {
                this.offlineMessage.show = false
            }
        },
        requestRefresh() {
            this.shouldRefresh = !this.shouldRefresh;
        },
        cleanFiltersAndSearchBarNow() {
            this.cleanFiltersAndSearchBar = !this.cleanFiltersAndSearchBar;
        },
        // Add other actions here...
        goToQuestionIDNow(questionID) {
            this.goToQuestionID = questionID;
        },
        setPageTitle(title){
          this.pageTitle = title;
        },
    },
})
