import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api/client";
import { scoreBulletText } from "@/features/cv-builder/schemas";
import { computeScores, getState } from "../state";
import { apiError, latency, scenarioOf } from "../utils";

const NOW = "2026-10-05T12:00:00+05:30";

export const cvHandlers = [
  http.get(`${API_BASE_URL}/cv`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const scores = computeScores(st.cv);
    return HttpResponse.json({
      locked: {
        version: st.cv.lockedVersion,
        lockedAt: st.cv.lockedAt,
        scores: st.cv.lockedScores,
      },
      draft: {
        version: st.cv.lockedVersion ? "V5 draft" : "V1 draft",
        sections: st.cv.sections,
        scores,
      },
      relock: st.cv.relock,
    });
  }),

  http.patch(`${API_BASE_URL}/cv/bullets/:id`, async ({ request, params }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const { text } = (await request.json()) as { text: string };
    if (!text.trim()) return apiError(422, "empty_bullet", "A bullet cannot be empty.");
    for (const sec of st.cv.sections) {
      const b = sec.bullets.find((x) => x.id === params.id);
      if (b) {
        Object.assign(b, { text: text.trim(), ...scoreBulletText(text) });
        return HttpResponse.json({ bullet: b, scores: computeScores(st.cv) });
      }
    }
    return apiError(404, "bullet_not_found", "We could not find that bullet.");
  }),

  http.get(`${API_BASE_URL}/cv/versions`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const items = [
      ...st.cv.versions,
      ...(st.cv.sections.length
        ? [
            {
              id: "draft",
              version: st.cv.lockedVersion ? "V5 draft" : "V1 draft",
              createdAt: NOW,
              score: computeScores(st.cv).overall,
              locked: false,
              current: false,
              note: "Your working draft",
            },
          ]
        : []),
    ];
    return HttpResponse.json({ items });
  }),

  http.post(`${API_BASE_URL}/cv/versions/:id/lock`, async ({ request, params }) => {
    await latency();
    const st = getState(scenarioOf(request));
    if (st.cv.lockedVersion) {
      return apiError(
        409,
        "relock_required",
        `${st.cv.lockedVersion} is locked. Request a re-lock to change it.`,
      );
    }
    if (params.id !== "draft")
      return apiError(404, "version_not_found", "We could not find that version.");
    st.cv.lockedVersion = "V1";
    st.cv.lockedAt = NOW;
    st.cv.lockedScores = computeScores(st.cv);
    st.cv.versions.push({
      id: "v1",
      version: "V1",
      createdAt: NOW,
      score: st.cv.lockedScores.overall,
      locked: true,
      current: true,
      note: "Locked from your draft",
    });
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${API_BASE_URL}/cv/relock-request`, async ({ request }) => {
    await latency();
    const st = getState(scenarioOf(request));
    const { reason } = (await request.json()) as { reason: string };
    if (!st.cv.lockedVersion) return apiError(409, "not_locked", "Your CV is not locked yet.");
    st.cv.relock = { status: "pending", requestedAt: NOW, reason };
    return HttpResponse.json({ status: "pending", requestedAt: NOW });
  }),
];
