from django.utils import timezone


STATUS_STEPS = (
    ('Order Placed', 'cart'),
    ('Order Dispatched', 'home'),
    ('Order in transit', 'truck'),
    ('Delivered successfully', 'check'),
)
PENDING_STEP_TIMES = (
    '',
    'Awaiting dispatch',
    'Awaiting transit',
    'Not delivered yet',
)


def apply_order_status(order, status, previous_status=None):
    if previous_status is None:
        previous_status = order.status
    status_choices = [choice[0] for choice in order.STATUS_CHOICES]
    current_index = status_choices.index(status)
    previous_index = status_choices.index(previous_status)
    history = list(order.status_history or [])

    while len(history) < len(STATUS_STEPS):
        title, icon = STATUS_STEPS[len(history)]
        history.append({'title': title, 'time': '', 'icon': icon})

    for index, (title, icon) in enumerate(STATUS_STEPS):
        history[index] = {
            **history[index],
            'title': title,
            'icon': icon,
            'completed': index <= current_index,
        }
        if index > current_index:
            history[index]['time'] = PENDING_STEP_TIMES[index]
        elif index == current_index and current_index != previous_index:
            history[index]['time'] = timezone.localtime().strftime('%b %d,%Y | %I:%M %p')

    order.status = status
    order.status_history = history
