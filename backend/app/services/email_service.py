from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


def send_invitation_email(player, contest):
    subject = f"You're Invited to Join '{contest.name}'"
    html_message = render_to_string(
        "contest_invite_email.html",
        {
            "player": player,
            "contest": contest,
            "invitation_link": f"https://{settings.FRONTEND_URL}/contests/{contest.id}",
        },
    )
    send_mail(
        subject=subject,
        message="You're invited!",
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[player.email],
        fail_silently=False,
    )
