import { SITE_CONFIG } from "@/lib/catalog";

export async function GET() {
  const now = new Date();
  let targetYear = now.getUTCFullYear();
  const candidateUtc = new Date(`${targetYear}-12-12T10:00:00Z`);
  if (candidateUtc.getTime() < now.getTime() - 86400000) {
    targetYear += 1;
  }

  // 12:00 – 19:00 Maputo time (CAT = UTC+2 -> 10:00Z to 17:00Z)
  const dtStart = `${targetYear}1212T100000Z`;
  const dtEnd = `${targetYear}1212T170000Z`;
  const dtStamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Taikonaut Maputo//The Homecoming Pop-Up//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:homecoming-popup-${targetYear}@taikonautmaputo.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:TAIKONAUT — ${SITE_CONFIG.popupEvent.title}`,
    `DESCRIPTION:TAIKONAUT Maputo Homecoming Pop-Up! Drop exclusivo\\, Day & Night Map Jackets\\, 3M Signature Hoodies\\, música e levantamento de reservas. Coordenadas: ${SITE_CONFIG.popupEvent.coordinates}. Direções: ${SITE_CONFIG.popupEvent.googleMapsUrl}`,
    `LOCATION:${SITE_CONFIG.popupEvent.venueName}\\, ${SITE_CONFIG.popupEvent.address}`,
    `GEO:${SITE_CONFIG.popupEvent.latitude};${SITE_CONFIG.popupEvent.longitude}`,
    `URL:${SITE_CONFIG.popupEvent.googleMapsUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:TAIKONAUT Homecoming Pop-Up começa em 2 horas no Restaurante Spazio!",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(icsLines, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="taikonaut-homecoming-popup.ics"',
      "Cache-Control": "no-store",
    },
  });
}
