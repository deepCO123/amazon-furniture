import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { ConsultationBooking } from "@/types";

const CONSULTATIONS_FILE = path.join(process.cwd(), "src", "data", "consultations.json");

async function getStoredConsultations(): Promise<ConsultationBooking[]> {
  try {
    const data = await readFile(CONSULTATIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveConsultations(items: ConsultationBooking[]): Promise<void> {
  await writeFile(CONSULTATIONS_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET() {
  try {
    const consultations = await getStoredConsultations();
    return NextResponse.json(consultations);
  } catch {
    return NextResponse.json(
      { error: "Failed to load consultations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const consultations = await getStoredConsultations();

    const newBooking: ConsultationBooking = {
      id: `CNS-${Date.now().toString().slice(-6)}`,
      fullName: body.fullName || "عميل كريم",
      phone: body.phone || "",
      consultType: body.consultType || "mansoura",
      address: body.address || "",
      googleMapsUrl: body.googleMapsUrl || "",
      spaceType: body.spaceType || "شركة ومكاتب إدارية",
      preferredTime: body.preferredTime || "في أقرب وقت",
      notes: body.notes || "",
      status: "new",
      createdAt: new Date().toISOString(),
    };

    consultations.unshift(newBooking);
    await saveConsultations(consultations);

    return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create consultation booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const consultations = await getStoredConsultations();
    const index = consultations.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    if (status) {
      consultations[index].status = status;
    }

    await saveConsultations(consultations);
    return NextResponse.json({ success: true, booking: consultations[index] });
  } catch {
    return NextResponse.json({ error: "Failed to update consultation" }, { status: 500 });
  }
}
