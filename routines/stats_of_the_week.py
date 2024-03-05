from datetime import datetime, timedelta
from website.models import Usuario

ammount_of_new_users = 0
ammount_of_minutes_recorded = 0
user = Usuario.query.all()
current_date = datetime.now()
last_week_date = current_date - timedelta(days=7)

for u in user:
    recordings = u.grabacions

    for r in recordings:
        if r.fecha > last_week_date:
            ammount_of_minutes_recorded += r.duracion  # Need to add the duration field
    
    if ammount_of_minutes_recorded != 0:  # Need to check if this contribution is the first
        ammount_of_new_users += 1

print("Ammount of new users: ", ammount_of_new_users)
print("Ammount of new min recorded: ", ammount_of_minutes_recorded)
