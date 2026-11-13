# QueueLess UI/UX Design Brief

## 1. Design direction

QueueLess should feel calm, clear, and operational. The interface should
reduce anxiety around waiting by making the user's position, queue state, and
next action immediately visible.

## 2. Core principles

1. **Clarity first** - show the current queue state and token status above
   secondary information.
2. **Progressive disclosure** - keep common actions visible and move
   configuration into focused panels.
3. **Role-aware navigation** - customers, staff, and admins should see only
   relevant navigation items.
4. **Trust and feedback** - confirm joins, calls, completions, errors, and
   destructive actions.
5. **Responsive by default** - support small mobile screens and larger
   operations dashboards.

## 3. Information architecture

### Customer navigation

- Home
- Organizations
- My dashboard
- Active token
- Account/logout

### Staff navigation

- Staff dashboard
- Assigned organizations
- Queue controls
- Queue token list
- Account/logout

### Admin navigation

- Admin dashboard
- Organizations
- Services
- Staff management
- Queue monitoring
- Account/logout

## 4. Screen requirements

### Home and organization screens

- Searchable or scannable organization list as the product grows.
- Organization name, type, address, description, and active state.
- Service cards with estimated duration.
- Clear primary action to view or join a service queue.

### Join queue

- Service name and estimated duration.
- Queue status: open, paused, or closed.
- Current serving token and waiting count where available.
- Authentication prompt when the customer is not logged in.
- Disabled join action when the queue is unavailable.

### Customer dashboard

- Large token number.
- Status badge: waiting, serving, completed, or cancelled.
- Queue and service name.
- Current serving token and approximate position where available.
- Refresh or live-update affordance.

### Staff dashboard

- Prominent queue status and pause/resume control.
- Waiting list ordered by token number.
- Single, clearly labeled call-next action.
- Serving customer panel with complete action.
- Confirmation feedback after every queue mutation.

### Admin dashboard

- Organization and service management.
- Staff creation and assignment.
- Clear distinction between account role and organization assignment.
- Confirmation before irreversible or access-changing operations.

## 5. Visual system

- Use a consistent spacing scale and card layout.
- Use one primary action color and semantic colors for queue states.
- Do not communicate status with color alone; pair colors with labels/icons.
- Keep text contrast at WCAG AA levels.
- Use readable body text and large numeric typography for token numbers.
- Keep loading, empty, success, and error states visually distinct.

## 6. Accessibility

- All controls must be keyboard reachable.
- Inputs require visible labels and useful validation messages.
- Focus states must remain visible.
- Dialogs must trap focus and support Escape to close.
- Status changes should be announced to assistive technology where practical.
- Touch targets should be large enough for mobile use.

## 7. Responsive behavior

- Mobile: stacked cards, bottom-safe primary actions, compact queue list.
- Tablet: two-column customer and queue detail layouts.
- Desktop: persistent navigation and multi-column staff/admin dashboards.
- Avoid horizontal scrolling for core workflows.
