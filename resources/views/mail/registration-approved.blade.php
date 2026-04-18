<x-mail::message>
# Your registration has been approved!

Your registration request for **{{ config('app.name') }}** has been approved. Click the button below to set your password and complete your account setup.

<x-mail::button :url="$setupUrl">
Set Your Password
</x-mail::button>

This link will expire in 7 days.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
