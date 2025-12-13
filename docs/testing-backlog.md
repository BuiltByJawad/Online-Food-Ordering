## Testing Backlog

Tracking tests to implement later (per user request, not executed now).

### Payments Foundation
- Unit: PaymentsService.createPaymentIntent (order access control, pending status set, payment record persisted).
- Unit: PaymentsService.confirmPaymentIntent (order access control, payment status -> succeeded, order paymentStatus -> paid).
- Integration: `/payments/:orderId/intent` requires auth + role (admin/customer), non-owner forbidden.
- Integration: `/payments/:orderId/confirm` updates payment + order; 404 when payment missing.
- Regression: Order paymentStatus stays in sync after confirm; ensure idempotency considerations for confirm.

### Orders-Payments Wiring
- Integration: `/orders/:orderId/payment-intent` and `/orders/:orderId/payment-intent/confirm` delegate to PaymentsService and mirror responses.
- Access control: non-owner/non-admin blocked from intents/confirmations.

### Analytics (existing)
- Smoke: `/orders/branch/:branchId/analytics` authorization for vendor owner/admin; correct aggregation window param.

### Notifications & Realtime (new)
- Unit: OrdersEventsGateway.handleConnection rejects missing/invalid JWT.
- Unit: OrdersEventsGateway emits status/rider events with correct payloads.
- Integration: order status updates emit `order.status.updated` (customer/rider timelines).
- Integration: rider assignment emits `order.rider.assigned`.
- E2E (future): web client receives realtime events and updates UI state; fallback polling still works.
- UI: vendor/rider pages reflect realtime status/assignment updates without manual refresh.
- Unit: NotificationsService routes channels (email/sms/push) when set; provider stubs invoked.
- Config: missing provider API keys log warnings but do not crash.

Add more suites once real providers, notifications, and security controls are implemented.
