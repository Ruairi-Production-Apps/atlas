# Refactoring Users and Permissions for Groups


## Group Admin > Users
In the Users list for a group, e.g.
http://localhost:3000/admin/organizations/group/ffa9761a-b44b-4c8f-9026-856fa1b7df88/edit

We need to split the Users tab into two sections:
1. Scouters
2. Parents

The Scouters section should show all users with the role of "scouter" and the Parents section should show all users with the role of "parent".

'Add Member' button becomes 'Add Scouter' and 'Add Parent' depending on the section.

For both options, a modal should open up with the same form as before, but with a different title and description. This modal explains that this is for adding a user who already has an account. If user types a name or email for which no user exists they get the option to 'Invite new user' which opens up the invite modal, detailed below

There will now be a second button for both sections to 'Invite new user'. This opens up the invite modal which gives two options:
1. Create and invite. User email of person to invite. If Scouter, their section/s and if they are Section Lead. If parent no additional info. 'Invite User' on click creates this user in DB and sends SendGrid confirmation email.
2. Invite by link. Creates a signup link that takes a visitor to the sign up page and preselects the Group and role they are being invited to. Invited user then proceeds through Signup flow.