from http import HTTPStatus
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.http import HttpResponse
from gutigers.forms import CommentForm
from gutigers.helpers.comment import CommentView
from gutigers.models import Comment, Team, User, UserProfile
from django.urls import reverse

def index(request):
    return render(request, 'gutigers/index.html')

def not_found(request):
    return render(request, 'gutigers/404.html')

def comment(request, *, comment_id):
    try: context_dict = {'comment': CommentView(Comment.objects.get(pk=comment_id))}
    except Comment.DoesNotExist: return redirect(reverse('gutigers:404'))
    return render(request, 'gutigers/components/comment.html', context=context_dict)

# FIXME: remove once login is complete, along with user retrieval
#@login_required
def comment_reply(request, *, comment_id):
    form = CommentForm()
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = UserProfile.objects.get(user=User.objects.get(pk=1))
            try: comment.replies_to = Comment.objects.get(pk=comment_id)
            except Comment.DoesNotExist: return HttpResponse(status=HTTPStatus.NOT_FOUND)
            comment.save()
            new_url = reverse('gutigers:comment', kwargs={'comment_id': comment.pk})
            return HttpResponse(f'<html><body>{new_url}</body></html>')
        else: print(form.errors)
    context_dict = {'comment_id': comment_id, 'form': form}
    return render(request, 'gutigers/components/reply.html', context=context_dict)

def team_detail(request, *, team_name_slug):
    context_dict = {'comments': list(map(CommentView, Comment.objects.filter(replies_to=None)))}
    try: context_dict['team'] = Team.objects.get(url_slug=team_name_slug)
    except Team.DoesNotExist: redirect(reverse('gutigers:404'))
    context_dict['supporter_count'] = (UserProfile.objects
                                       .filter(support_team=context_dict['team']).count())
    return render(request, 'gutigers/team.html', context=context_dict)

def contact(request):
    return render(request, 'gutigers/contact.html')

def player(request):
    return render(request, 'gutigers/player.html')

def post(request):
    return render(request, 'gutigers/post.html')

def login(request):
    return render(request, 'gutigers/login.html')

def register(request):
    return render(request, 'gutigers/register.html')

def result(request):
    return render(request, 'gutigers/result.html')

def user(request, *, username_slug):
    return render(request, 'gutigers/user.html')
