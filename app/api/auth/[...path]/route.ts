import { type NextRequest } from 'next/server';
import { auth } from '@/lib/auth/better-auth';

const handler = auth.handler();

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(req: NextRequest, ctx: any) { return handler.GET(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return handler.POST(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return handler.PUT(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return handler.DELETE(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return handler.PATCH(req, ctx); }
