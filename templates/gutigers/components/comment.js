'use strict';
// {% load staticfiles %}

function expandComment(commentId, force_state) {
    const expandable = document.getElementById('comment-expandable-' + commentId);
    expandable.open = force_state === null ? !expandable.open : force_state;
    document.getElementById('expand-btn-' + commentId).innerText = expandable.open ?
        'Hide replies' : 'Show replies';
}

function collapseReplyForm(commentId) {
    const replySection = document.getElementById('reply-' + commentId);
    const replyButton = document.getElementById('reply-btn-' + commentId);
    replySection.innerHTML = '';
    replyButton.src = '{% static "images/comment/reply.png" %}';
}

function rate(commentId, ratingUrl, direction) {
    request('POST', ratingUrl, function (response) {
        if (response.status != 200) window.location.href = '{% url "gutigers:login" %}';
        else document.getElementById('rating-count-' + commentId).innerHTML = response.responseText;
    }).send('direction=' + direction);
}

function submitForm(commentId, commentUrl) {
    const cancelRedirectFrame = document.getElementById('cancel-redirect-' + commentId);
    const replyForm = document.getElementById('reply-form-' + commentId);

    if (commentId === 'new') {
        cancelRedirectFrame.onload = function () {
            const newUrl = cancelRedirectFrame.contentDocument.body.innerText;
            collapseReplyForm('new');
            request('GET', newUrl, function (response) {
                if (response.status != 200) return;
                document.getElementById('comment-section-container')
                    .innerHTML += response.responseText;
            }).send();
        };
        replyForm.submit();
        return;
    }

    cancelRedirectFrame.onload = function () {
        const newUrl = cancelRedirectFrame.contentDocument.body.innerText;
        collapseReplyForm(commentId);
        const replyList = document.getElementById('reply-list-' + commentId);
        if (replyList === null) {
            request('GET', commentUrl, function (response) {
                if (response.status != 200) return;
                const commentMain = document.getElementById('comment-main-' + commentId);
                commentMain.parentElement.innerHTML = response.responseText;
                expandComment(commentId, true);
            }).send();
        } else {
            request('GET', newUrl, function (response) {
                if (response.status != 200) return;
                const newItem = document.createElement('li');
                newItem.innerHTML = response.responseText;
                replyList.appendChild(newItem);
                expandComment(commentId, true);
            }).send();
        }
    };
    replyForm.submit();
}

function toggleReplyForm(commentId, url) {
    const replySection = document.getElementById('reply-' + commentId);
    const replyButton = document.getElementById('reply-btn-' + commentId);
    if (replySection.childElementCount === 0) {
		const allReplySections = document.getElementsByClassName('reply-box');
		for (const oneReplySection of allReplySections) {
			if (oneReplySection.childElementCount !== 0)
				collapseReplyForm(oneReplySection.parentElement.getAttribute('data-id'));
		}
        request('GET', url, function (response) {
            if (response.status === 200) replySection.innerHTML = response.responseText;
            else if (response.status === 404) window.location.href = '{% url "gutigers:login" %}';
        }).send();
        replyButton.src = '{% static "images/comment/close.png" %}';
    } else collapseReplyForm(commentId);
}

function request(method, url, callback) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4) callback(this);
    };
    request.open(method, url, true);
    if (method === 'POST') request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    return request;
}
