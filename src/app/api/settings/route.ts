import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_STANDARD_RATES, DEFAULT_SUPPLIER_INFO, DEFAULT_ESTIMATE_RATES, DEFAULT_RATE_NOTICE_INFO } from '@/lib/defaultRates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.masterSetting.findMany();
    const settingsMap: Record<string, any> = {};

    settings.forEach((s) => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch (e) {
        settingsMap[s.key] = s.value;
      }
    });

    return NextResponse.json({
      standardRates: settingsMap['STANDARD_RATES'] || DEFAULT_STANDARD_RATES,
      rateNoticeInfo: settingsMap['RATE_NOTICE_INFO'] || DEFAULT_RATE_NOTICE_INFO,
      supplierInfo: settingsMap['SUPPLIER_INFO'] || DEFAULT_SUPPLIER_INFO,
      defaultRates: settingsMap['DEFAULT_RATES'] || DEFAULT_ESTIMATE_RATES,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { standardRates, rateNoticeInfo, supplierInfo, defaultRates } = body;

    const upserts = [];

    if (standardRates) {
      upserts.push(
        prisma.masterSetting.upsert({
          where: { key: 'STANDARD_RATES' },
          update: { value: JSON.stringify(standardRates) },
          create: { key: 'STANDARD_RATES', value: JSON.stringify(standardRates), description: 'KOSA 표준 노임단가' },
        })
      );
    }

    if (rateNoticeInfo) {
      upserts.push(
        prisma.masterSetting.upsert({
          where: { key: 'RATE_NOTICE_INFO' },
          update: { value: JSON.stringify(rateNoticeInfo) },
          create: { key: 'RATE_NOTICE_INFO', value: JSON.stringify(rateNoticeInfo), description: '노임단가 공고 및 기준일 정보' },
        })
      );
    }

    if (supplierInfo) {
      upserts.push(
        prisma.masterSetting.upsert({
          where: { key: 'SUPPLIER_INFO' },
          update: { value: JSON.stringify(supplierInfo) },
          create: { key: 'SUPPLIER_INFO', value: JSON.stringify(supplierInfo), description: '자사 공급자 정보' },
        })
      );
    }

    if (defaultRates) {
      upserts.push(
        prisma.masterSetting.upsert({
          where: { key: 'DEFAULT_RATES' },
          update: { value: JSON.stringify(defaultRates) },
          create: { key: 'DEFAULT_RATES', value: JSON.stringify(defaultRates), description: '기본 제경비/기술료 요율' },
        })
      );
    }

    await prisma.$transaction(upserts);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
