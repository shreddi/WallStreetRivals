from django.contrib.auth.forms import PasswordResetForm
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings

class CustomPasswordResetForm(PasswordResetForm):
    def save(self, domain_override=None, use_https=False, token_generator=default_token_generator, request=None, **kwargs):
        email = self.cleaned_data["email"]
        for user in self.get_users(email):
            if not domain_override:
                # Ensure FRONTEND_URL does not already include protocol
                domain = settings.FRONTEND_URL.replace('http://', '').replace('https://', '').rstrip('/')
            else:
                domain = domain_override.replace("http://", "").replace("https://", "").rstrip('/')

            # Construct the full domain with protocol
            protocol = "https" if use_https else "http"
            full_domain = f"{protocol}://{domain}"

            # Build the context for the email template
            context = {
                "email": user.email,
                "domain": full_domain,
                "site_name": "Your App Name",
                "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                "token": token_generator.make_token(user),
                "user": user,
                "reset_path": f"/reset_password_confirm/{urlsafe_base64_encode(force_bytes(user.pk))}/{token_generator.make_token(user)}"
            }

            subject = "Password Reset Requested"
            email_template_name = "registration/password_reset_email.html"

            # Render the email body with the correct context
            email_body = render_to_string(email_template_name, context)

            # Debugging print to verify email content before sending
            print(email_body)

            # Send the email
            send_mail(
                subject, email_body, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False
            )
