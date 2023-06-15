export const apiRemoteHost = 'https://hvcao-api.sky-t.nl';

export async function fetchQuestionData() {
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

export async function fetchLatestQuestionId() {
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
    const token = sessionStorage.getItem('token');
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
            return true;
        } else {
            const responseJson = await response.json();
            console.log(responseJson);
        }
    } catch (e) {
        console.warn('Unable to update item. Offline?', e);
        throw e;
    }
}



export async function submitQuestion(question) {
    const token = sessionStorage.getItem('token');
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
    } catch (e) {
        console.warn('Unable to post to api. Offline?', e)
    }
}


export async function changePassword(newPassword) {
    const token = sessionStorage.getItem('token');
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
    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch(apiRemoteHost + `/api/question-data/${id}/`, {
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

