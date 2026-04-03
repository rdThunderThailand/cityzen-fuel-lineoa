// app/api/webhook/route.ts
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
  const body = await req.json();
  const signature = req.headers.get("x-line-signature") as string;

  // ตรวจสอบ Signature เพื่อความปลอดภัย
  if (
    !line.validateSignature(
      JSON.stringify(body),
      config.channelSecret,
      signature,
    )
  ) {
    return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  }

  const events: line.WebhookEvent[] = body.events;

  await Promise.all(
    events.map(async (event) => {
      if (event.type === "message" && event.message.type === "location") {
        const { latitude, longitude } = event.message;

        // เรียกใช้ API ของ Thunder Core ผ่าน API Key
        const stations = await fetchNearbyStations(latitude, longitude);

        if (stations.length === 0) {
          return client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: "text",
                text: "ไม่พบข้อมูลปั๊มน้ำมันจากระบบหลักในขณะนี้",
              },
            ],
          });
        }

        const bubbles: line.FlexBubble[] = stations
          .slice(0, 10)
          .map((station) => {
            const distKm = (station.distance_meters / 1000).toFixed(2);

            return {
              type: "bubble",
              size: "mega",
              hero: {
                type: "image",
                url:
                  station.brand === "PTT"
                    ? "https://silas-caruncular-erna.ngrok-free.dev/ptt.jpg"
                    : "https://mpics.mgronline.com/pics/Images/566000002821101.JPEG",
                size: "full",
                aspectRatio: "20:13",
                aspectMode: "cover",
              },
              body: {
                type: "box",
                layout: "vertical",
                paddingAll: "12px",
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
                        paddingStart: "8px",
                        paddingEnd: "8px",
                        paddingTop: "2px",
                        paddingBottom: "2px",
                        flex: 0,
                        contents: [
                          {
                            type: "icon",
                            url: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
                            size: "xxs",
                          },
                          {
                            type: "text",
                            text: "มีบริการ",
                            color: "#1ca34d",
                            size: "xs",
                            weight: "bold",
                            margin: "sm",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "05:42 น.",
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
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    margin: "md",
                    contents: [
                      {
                        type: "icon",
                        url: "https://cdn-icons-png.flaticon.com/512/2838/2838912.png",
                        size: "xs",
                      },
                      {
                        type: "text",
                        text: `ห่างจากคุณ ${distKm} กม.`,
                        color: "#8c8c8c",
                        size: "sm",
                        margin: "sm",
                        flex: 0,
                      },
                    ],
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    margin: "md",
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
                        margin: "sm",
                        flex: 0,
                      },
                      {
                        type: "icon",
                        url: "https://cdn-icons-png.flaticon.com/512/3204/3204121.png",
                        size: "xs",
                        margin: "md",
                      },
                      {
                        type: "text",
                        text: "คิวน้อย",
                        color: "#8c8c8c",
                        size: "xs",
                        margin: "sm",
                        flex: 0,
                      },
                    ],
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    margin: "md",
                    backgroundColor: "#f4eaff",
                    paddingStart: "8px",
                    paddingEnd: "8px",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    cornerRadius: "8px",
                    flex: 0,
                    contents: [
                      { type: "text", text: "🕒", size: "xs" },
                      {
                        type: "text",
                        text: "อัปเดตล่าสุด 5 นาทีที่แล้ว",
                        color: "#631da7",
                        size: "xs",
                        margin: "sm",
                      },
                    ],
                  },
                ],
              },
              footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                paddingAll: "12px",
                contents: [
                  {
                    type: "button",
                    style: "primary",
                    color: "#304052",
                    height: "sm",
                    action: {
                      type: "uri",
                      label: "📍 แผนที่",
                      // แก้ไขจุดผิด: ลบเลข 6 ออก และใช้ query parameter ที่ถูกต้อง
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
                      // ใส่ Link สำหรับแจ้งข้อมูล (เช่น LIFF หรือเบอร์โทร)
                      uri: `https://line.me/R/nv/location/`,
                    },
                  },
                ],
              },
            };
          });

        // ส่งกลับหา User
        try {
          return await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: "flex",
                altText: "ปั๊มน้ำมันใกล้คุณ",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                contents: { type: "carousel", contents: bubbles as any },
              },
            ],
          });
        } catch (error: unknown) {
          const err = error as {
            originalError?: { response?: { data?: unknown } };
            message?: string;
          };
          console.error(
            "LINE API Error:",
            err.originalError?.response?.data || error,
          );
          return NextResponse.json(
            { status: "error", error: err.message || "Unknown error" },
            { status: 500 },
          );
        }
      }
      if (event.type === "message" && event.message.type === "text") {
        // กรณี Rich Menu ส่ง Action เป็น Message
        // const userText = event.message.text;

        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: `P KUNG SO HANDSOME AND SMART MAK MAK KUB JUB JUB`,
            },
          ],
        });
      }

      if (event.type === "postback") {
        // กรณี Rich Menu ส่ง Action เป็น Postback (นิยมใช้ส่งค่า ID/Data)
        const data = event.postback.data;

        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: "text", text: `Postback data คือ: ${data}` }],
        });
      }
    }),
  );

  return NextResponse.json({ status: "ok" });
}
