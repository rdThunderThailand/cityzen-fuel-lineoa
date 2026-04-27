import { NextRequest, NextResponse } from "next/server";
import * as line from "@line/bot-sdk";
import { fetchNearbyStations } from "@/services/thunder-core";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

export async function POST(req: NextRequest) {
  // 1. รับค่าเป็น text (Raw Body) เพื่อเช็ค Signature ให้แม่นยำ
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") as string;

  // 2. ตรวจสอบ Signature โดยใช้ channelSecret เท่านั้น
  if (!line.validateSignature(rawBody, config.channelSecret, signature)) {
    console.error("❌ Signature Verification Failed");
    return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  }

  // 3. แปลงเป็น JSON หลังจากเช็ค Signature เสร็จ
  const body = JSON.parse(rawBody);
  const events: line.WebhookEvent[] = body.events;

  await Promise.all(
    events.map(async (event) => {
      if (event.type === "message" && event.message.type === "location") {
        const { latitude, longitude } = event.message;

        const stations = await fetchNearbyStations(latitude, longitude);

        if (!stations || stations.length === 0) {
          return client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: "text",
                text: "ไม่พบข้อมูลปั๊มน้ำมันในพิกัดใกล้เคียงของคุณ",
              },
            ],
          });
        }

        const bubbles: line.FlexBubble[] = stations
          .slice(0, 10)
          .map((station) => {
            const distKm = (station.distance_meters / 1000).toFixed(2);

            // --- 🕒 Logic คำนวณเวลาจริง ---
            const now = new Date();
            let latestUpdate: Date | null = null;

            if (station.fuel_status && station.fuel_status.length > 0) {
              const times = station.fuel_status.map((fs) =>
                new Date(fs.updated_at).getTime(),
              );
              latestUpdate = new Date(Math.max(...times));
            }

            const updateTime = latestUpdate || now;
            const diffMs = now.getTime() - updateTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            let timeLabel = "";
            if (diffMins < 1) timeLabel = "เมื่อสักครู่";
            else if (diffMins < 60) timeLabel = `${diffMins} นาทีที่แล้ว`;
            else if (diffMins < 1440)
              timeLabel = `${Math.floor(diffMins / 60)} ชม.ที่แล้ว`;
            else timeLabel = "มากกว่า 1 วันที่แล้ว";

            const thaiTime = updateTime.toLocaleString("en-US", {
              timeZone: "Asia/Bangkok",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });

            return {
              type: "bubble",
              size: "mega",
              hero: {
                type: "image",
                url:
                  station.brand === "PTT"
                    ? "https://cityzen-fuel-lineoa.vercel.app/ptt-station.jpg"
                    : "https://mpics.mgronline.com/pics/Images/566000002821101.JPEG",
                size: "full",
                aspectRatio: "20:13",
                aspectMode: "cover",
              },
              body: {
                type: "box",
                layout: "vertical",
                paddingAll: "20px",
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "box",
                        layout: "baseline",
                        backgroundColor: "#e0f8e9",
                        cornerRadius: "100px",
                        paddingStart: "10px",
                        paddingEnd: "10px",
                        paddingTop: "2px",
                        paddingBottom: "2px",
                        flex: 0,
                        contents: [
                          {
                            type: "text",
                            text: "● มีบริการ",
                            color: "#1ca34d",
                            size: "xs",
                            weight: "bold",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: `${thaiTime} น.`,
                        color: "#8c8c8c",
                        size: "sm",
                        align: "end",
                        gravity: "center",
                      },
                    ],
                  },
                  {
                    type: "text",
                    text: station.name || "ปั๊มน้ำมัน",
                    weight: "bold",
                    size: "xl",
                    margin: "md",
                    wrap: true,
                    color: "#304052",
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    margin: "md",
                    spacing: "sm",
                    contents: [
                      {
                        type: "icon",
                        url: "https://cdn-icons-png.flaticon.com/512/2838/2838912.png",
                        size: "xs",
                      },
                      {
                        type: "text",
                        text: `${station.province || "ใกล้เคียง"} ${distKm} กม.`,
                        color: "#8c8c8c",
                        size: "sm",
                        flex: 0,
                      },
                    ],
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    margin: "md",
                    spacing: "lg",
                    contents: [
                      {
                        type: "box",
                        layout: "baseline",
                        spacing: "sm",
                        contents: [
                          {
                            type: "icon",
                            url: "https://cdn-icons-png.flaticon.com/512/2088/2088617.png",
                            size: "xs",
                          },
                          {
                            type: "text",
                            text: "25 นาที",
                            color: "#8c8c8c",
                            size: "xs",
                          },
                        ],
                      },
                      {
                        type: "box",
                        layout: "baseline",
                        spacing: "sm",
                        contents: [
                          {
                            type: "icon",
                            url: "https://cdn-icons-png.flaticon.com/512/3204/3204121.png",
                            size: "xs",
                          },
                          {
                            type: "text",
                            text: "คิวน้อย",
                            color: "#8c8c8c",
                            size: "xs",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    margin: "xl",
                    backgroundColor: "#f4eaff",
                    paddingStart: "12px",
                    paddingEnd: "12px",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    cornerRadius: "12px",
                    contents: [
                      {
                        type: "text",
                        text: `🕒 อัปเดตล่าสุดเมื่อ ${timeLabel}`,
                        color: "#631da7",
                        size: "xs",
                        weight: "bold",
                      },
                    ],
                  },
                ],
              },
              footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                paddingAll: "20px",
                paddingTop: "0px",
                contents: [
                  {
                    type: "button",
                    style: "primary",
                    color: "#304052",
                    height: "md",
                    action: {
                      type: "uri",
                      label: "📍 แผนที่",
                      // ✅ แก้ไข URI ตรงนี้ให้ถูกต้อง
                      uri: `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`,
                    },
                  },
                  {
                    type: "button",
                    style: "link",
                    height: "sm",
                    color: "#304052",
                    action: {
                      type: "uri",
                      label: "💬 แจ้งข้อมูลเพิ่ม",
                      uri: `https://cityzen-fuel-lineoa.vercel.app/report?id=${station.id}`,
                    },
                  },
                ],
              },
            };
          });

        try {
          return await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: "flex",
                altText: "ปั๊มน้ำมันใกล้คุณ",
                contents: { type: "carousel", contents: bubbles as any },
              },
            ],
          });
        } catch (error: any) {
          console.error(
            "LINE Reply Error:",
            error.originalError?.response?.data || error.message,
          );
        }
      }
    }),
  );

  return NextResponse.json({ status: "ok" });
}
