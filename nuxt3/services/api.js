//This file contains al functions related to handling the calls to the remote API that contains the question database.
 export const apiRemoteHost = 'https://hvcao-api.sky-t.nl';

// export const apiRemoteHost = 'http://0.0.0.0:8000';

export async function fetchQuestionData() {
    // Retrieves the latest question database from the API Server
    const response = await fetch(apiRemoteHost + '/api/question-data/');
    try {
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('Unable to connect to api. Offline?', e)
    }

    throw new Error('Failed to fetch question data');
}

export async function fetchLatestQuestionDatabaseVersion() {
    // Retrieves the latest QuestionDatabase version number to compare with the local question database.
    // This will be used to decide if the remote database will be downloaded
    try {
        const response = await fetch(apiRemoteHost + '/api/question-version/');
        if (response.ok) {
            const data = await response.json();
            return data.version;
        }
    } catch (e) {
        console.warn('Unable to fetch questionid. Offline?', e)
    }
}

export async function editQuestion(id, question) {
    // Update a question on the remote server database
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(apiRemoteHost + '/api/question-data/' + id + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(question),
        });
        if (response.ok) {
            return ['editedSuccessfullyAlert', 'Vraag aangepast!'];
        } else {
            const responseJson = await response.json();
            return ['editedErrorAlert', 'Foutmelding bij het aanpassen: ' + responseJson]
        }
    } catch (e) {
        console.warn('Unable to update item. Offline?', e);
        throw e;
    }
}



export async function submitQuestion(question) {
    // Add a new question to the remote question database
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(apiRemoteHost + '/api/question-data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(question),
        });

        if (response.ok) {
            return true;
        }
        if (response.status === 401) {
           console.warn('Token invalid. logging out')
           localStorage.clear('token')
        }

    } catch (e) {
        console.warn('Unable to post to api. Offline?', e)
    }
}


export async function changePassword(newPassword) {
    // Change a users password
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(apiRemoteHost + '/api/change-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({"newPassword": newPassword})
        });
        if (response.ok) {
            return true;
        }
    } catch (e) {
        console.warn('Unable to post to api. Offline?', e)
    }
}

export async function deleteQuestion(id) {
    // Delete a question from the remote server
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(apiRemoteHost + `/api/question-data/delete/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
        });
        if (response.ok) {
            return ['successAlert', 'Question Deleted'];
        }
        if (response.status === 401) {
            return ['errorAlert', 'You can only delete your own questions!'];

        } else {
            return ['errorAlert', 'Server Error!'];
        }
    } catch (e) {
        console.warn('Unable to delete question. Offline?', e)
    }

}

