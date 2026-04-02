# Thunder Core Platform — API Reference

> **เอกสารนี้จัดทำขึ้นสำหรับ Developer ที่ต้องการเชื่อมต่อระบบภายนอกเข้ากับ Thunder Core Platform**  
> Supabase Project: thundercore.vercel.app  
> Base URL: https://thundercore.vercel.app

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Core Concepts — Tenants, Users, Roles](#2-core-concepts)
3. [REST API Endpoints](#3-rest-api-endpoints)
   - [Tenants](#31-tenants)
   - [Members](#32-members)
   - [Applications](#33-applications)
   - [Users (Super Admin)](#34-users-super-admin)
   - [Assets & Devices](#35-assets--devices)
   - [Player / Device Agent](#36-player--device-agent)
   - [Fuel Map (CityZen)](#37-fuel-map-cityzen)
   - [Dashboard Stats](#38-dashboard-stats)
4. [Realtime Subscriptions](#4-realtime-subscriptions)
5. [Database Schema Quick Reference](#5-database-schema-quick-reference)
6. [Row Level Security (RLS) Rules](#6-row-level-security-rls-rules)
7. [Error Handling](#7-error-handling)
8. [Environment Variables](#8-environment-variables)

---

## 1. Authentication

> **⚠️ ไม่มี THUNDER_API_KEY แบบ Platform-wide**  
> Thunder Core ใช้ **Supabase JWT** เป็นหลัก หรือใช้ **Application API Key** สำหรับ Machine-to-Machine  
> ไม่มี env var ชื่อ NEXT_PUBLIC_THUNDER_API_KEY — ให้ใช้ตามวิธีด้านล่าง

---

### วิธีที่ 1 — Supabase JWT (ใช้สำหรับ Authenticated Requests)

Token ได้จาก Supabase Session ของ User ที่ Login ผ่าน Header:

http
Authorization: Bearer <supabase_access_token>

typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign in ด้วย Email/Password
const { data } = await supabase.auth.signInWithPassword({
email: 'user@example.com',
password: 'password'
})

const token = data.session?.access_token // ← ใช้ token นี้ใน Authorization header

---

### วิธีที่ 2 — Application API Key (Machine-to-Machine)

สำหรับ External Project ที่ต้องการเรียก API โดยไม่ผ่าน User Login  
Key รูปแบบ: tk\_<64-hex-chars>

**ขั้นตอนการสร้าง:**

1. Login เข้า Thunder Core Dashboard ด้วย Super Admin
2. ไปที่ **Applications** → เลือกแอปที่ต้องการ
3. กด **Generate API Key** (POST `/api/applications/:id/api-key`)
4. Copy key มาใส่ใน .env.local ของ External Project:

env
THUNDER_APP_API_KEY=tk_a1b2c3d4e5f6...

> ⚠️ Key นี้เป็น Secret — ห้ามใช้ NEXT*PUBLIC* prefix  
> ⚠️ เก็บใน Server-side เท่านั้น (Server Actions, API Routes)

---

### Roles & Permissions

| Role        | Code          | สิทธิ์                     |
| ----------- | ------------- | -------------------------- |
| Super Admin | super_admin   | เข้าถึงทุกอย่าง ทุก Tenant |
| Admin       | admin_company | จัดการ Tenant ของตัวเอง    |
| Operator    | operator      | อ่านข้อมูลใน Tenant ของตัว |

> **หมายเหตุ:** Role ถูกกำหนดผ่าน app_metadata.role (JWT) หรือผ่าน membership_roles → roles.code ใน DB

---

## 2. Core Concepts

### Tenant

องค์กรหรือบริษัทที่ใช้งาน Platform เช่น "บริษัท ABC", "เทศบาลนครเชียงใหม่"

- ทุก resource (Assets, Members, Applications) ถูก scoped ตาม tenant_id
- Super Admin มองเห็นทุก Tenant
- Admin/Operator มองเห็นเฉพาะ Tenant ของตัวเอง

### Membership

การที่ User เป็น Member ของ Tenant

- ตาราง: memberships (user_id + tenant_id)
- Role ของ User ใน Tenant ดูจาก membership_roles → roles.code

### Application

แอปพลิเคชันที่ Tenant สร้างหรือถูกเชิญให้ใช้งาน

- ตาราง: applications
- แอปอาจเป็น "owned" (tenant_id) หรือ "invited" (organization_applications)

---

## 3. REST API Endpoints

> ทุก Endpoint ที่ต้องการ Auth ส่ง Authorization: Bearer <token>  
> Response ทั่วไป: { data: [...], count: N } หรือ { error: "message" }

---

### 3.1 Tenants

#### GET /api/tenants

ดึงรายการ Tenant ทั้งหมด  
**Auth:** Super Admin เท่านั้น

http
GET /api/tenants
Authorization: Bearer <token>

**Response:**
json
[
{
"id": "uuid",
"name": "Thunder Enterprise",
"type": "enterprise",
"memberCount": 5,
"appCount": 2,
"status": "active",
"createdAt": "2026-01-01T00:00:00Z"
}
]

#### POST /api/tenants

สร้าง Tenant ใหม่  
**Auth:** Super Admin เท่านั้น

http
POST /api/tenants
Content-Type: application/json
Authorization: Bearer <token>

{
"name": "บริษัทใหม่ จำกัด",
"type": "enterprise",
"status": "active"
}

#### GET /api/tenants/:id

ดึงรายละเอียด Tenant

#### PUT /api/tenants/:id

อัปเดต Tenant

json
{
"name": "ชื่อใหม่",
"status": "active",
"contact_email": "admin@company.com",
"website_url": "https://company.com",
"description": "รายละเอียด"
}

#### DELETE /api/tenants/:id

ลบ Tenant (Super Admin, ต้องไม่มี members/apps เหลือ)

#### GET /api/tenants/stats

สถิติรวม Tenants  
**Auth:** Super Admin

json
{
"tenants": [...],
"totalTenants": 10,
"totalMembers": 45,
"totalApps": 12,
"activeTenants": 8
}

---

### 3.2 Members

#### GET /api/tenants/:id/members

ดึงสมาชิกใน Tenant

**Response:**
json
[
{
"id": "user-uuid",
"name": "สมชาย ใจดี",
"email": "somchai@example.com",
"role": "operator",
"avatar_url": "https://...",
"joined_at": "2026-01-15T00:00:00Z"
}
]

#### POST /api/tenants/:id/members

เพิ่ม Member เข้า Tenant

json
{
"email": "user@example.com",
"role": "operator"
}

#### GET /api/tenants/:id/members/:memberId

ดึงข้อมูล Member รายบุคคล

#### DELETE /api/tenants/:id/members/:memberId

ลบ Member ออกจาก Tenant

#### GET /api/tenants/:id/members/:memberId/profile

ดึง Profile + Memberships ของ Member

#### GET /api/tenants/:id/members/:memberId/applications

ดึงรายการ Applications ที่ Member เข้าถึงได้

#### GET /api/members

ดึง Members ทั้งหมด (ตาม Tenant ของ User ที่ Login)

---

### 3.3 Applications

#### GET /api/applications

ดึง Applications ทั้งหมด  
**Auth:** Super Admin

#### POST /api/applications

สร้าง Application ใหม่

json
{
"name": "My App",
"description": "รายละเอียดแอป",
"environment": "production",
"url": "https://myapp.com"
}

#### GET /api/applications/:id

ดึง Application โดย ID

#### PUT /api/applications/:id

แก้ไข Application

#### DELETE /api/applications/:id

ลบ Application

#### GET /api/applications/:id/stats

สถิติของ Application เช่น member count, active sessions

#### GET /api/applications/:id/members

สมาชิกที่มีสิทธิ์เข้าใช้ Application

#### GET /api/applications/:id/logs

บันทึก Log ของ Application

#### GET /api/applications/:id/api-key

ดึง API Key ของ Application

#### GET /api/applications/stats

สถิติรวม Applications ทั้งหมด (Super Admin)

#### GET /api/tenants/:id/applications

ดึง Applications ที่ Tenant เป็นเจ้าของหรือถูกเชิญ

json
[
{
"id": "app-uuid",
"name": "Fleet Tracker",
"status": "active",
"environment": "production",
"url": "https://fleet.example.com"
}
]

#### POST /api/tenants/:id/applications

สร้าง Application สำหรับ Tenant

---

### 3.4 Users (Super Admin)

#### GET /api/users

ดึง Users ทั้งหมดใน Platform  
**Auth:** Super Admin

json
[
{
"id": "uuid",
"email": "user@example.com",
"first_name": "สมชาย",
"last_name": "ใจดี",
"is_active": true,
"is_super_admin": false,
"created_at": "2026-01-01T00:00:00Z"
}
]

#### POST /api/users

สร้าง User ใหม่  
**Auth:** Super Admin

json
{
"email": "newuser@example.com",
"first_name": "ชื่อ",
"last_name": "นามสกุล",
"role": "operator"
}

#### GET /api/users/:id

ดึงข้อมูล User โดย ID

#### GET /api/users/:id/debug

Debug User — ดู profile, roles, memberships (Super Admin)

---

### 3.5 Assets & Devices

#### GET /api/assets/status?tenantId=:id

ดึงสถานะออนไลน์ของ Assets ใน Tenant  
**Auth:** Authenticated User (RLS จำกัดตาม Tenant)

json
{
"data": [
{
"id": "asset-uuid",
"connection_status": "online",
"last_heartbeat_at": "2026-03-30T07:00:00Z"
}
]
}

**`connection_status` values:** `online`, `offline`, busy

---

### 3.6 Player / Device Agent

**หมายเหตุ:** Endpoints เหล่านี้สำหรับ **Hardware Player/Device** ไม่ใช่ Web Client

#### POST /api/player/register

ลงทะเบียน Device ใหม่

json
{
"MachineName": "PLAYER-01",
"HardwareId": "ABC123DEF456"
}

**Response:**
json
{
"token": "TKN-PLAYER-01-ABC123DE",
"status": "Success"
}

#### POST /api/player/heartbeat

ส่ง Heartbeat จาก Device

json
{
"DeviceToken": "TKN-PLAYER-01-ABC123DE",
"Status": "online",
"CurrentFile": "content_001.mp4"
}

#### POST /api/player/retrieve

Activate Device ด้วย Activation Code (ดึงจากหน้า Assets ใน Dashboard)

json
{
"activation_code": "ACT-XXXXXXXX"
}

**Response:**
json
{
"status": "success",
"message": "Device activated successfully",
"data": {
"asset_id": "uuid",
"tenant_id": "uuid",
"mqtt_client_id": "device-client-id",
"device_name": "PLAYER-01"
}
}

---

### 3.7 Fuel Map (CityZen)

> **Public Endpoints** — ไม่ต้องใช้ Auth token

#### GET /api/fuel/stations

ดึงรายการปั๊มน้ำมันพร้อมสถานะน้ำมัน

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| province | string | กรองตามจังหวัด เช่น เชียงใหม่ |
| brand | string | กรองตามแบรนด์ เช่น `PTT`, Shell |
| available | boolean | true = แสดงเฉพาะปั๊มที่มีน้ำมัน |

**Response:**
json
{
"data": [
{
"id": "uuid",
"name": "ปั๊ม PTT สาขา A",
"brand": "PTT",
"latitude": 18.7883,
"longitude": 98.9853,
"province": "เชียงใหม่",
"district": "เมือง",
"address": "...",
"is_active": true,
"fuel_status": [
{
"is_available": true,
"price": 36.5,
"updated_at": "2026-03-30T06:00:00Z",
"fuel_type": {
"id": "uuid",
"code": "91",
"name": "แก๊สโซฮอล์ 91",
"color_code": "#22c55e",
"sort_order": 1
}
}
]
}
],
"count": 42
}

#### GET /api/fuel/stations/:id

ดึงข้อมูลปั๊มน้ำมัน 1 สาขา

#### PATCH /api/fuel/stations/:id/status

อัปเดตสถานะน้ำมัน (Staff ของ Tenant เท่านั้น)  
**Auth Required**

json
{
"fuelTypeId": "uuid",
"isAvailable": true,
"price": 36.50
}
