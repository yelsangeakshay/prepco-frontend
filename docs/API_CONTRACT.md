# API contract (mock, `/api/v1`)

Updated as handlers are added. Real backend must honour the same shapes.

List endpoints accept `page, pageSize, sort, q` and return `{ items, total, page, pageSize }`.

## GET /me

```json
{ "id": "st-riya", "role": "student", "name": "Riya Kulkarni", "initials": "RK", "onboarded": true }
```

`role` is `student | panelist | ops`. Mock role comes from the `prepco_role` cookie; scenario from the `x-prepco-scenario` header.
