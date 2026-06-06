import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, tags } = body;

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Mã xác thực secret không hợp lệ.' }, { status: 401 });
    }

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ message: 'Danh sách tags không hợp lệ.' }, { status: 400 });
    }

    for (const tag of tags) {
      revalidateTag(tag, 'max');
    }

    return NextResponse.json({
      revalidated: true,
      tags,
      now: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
