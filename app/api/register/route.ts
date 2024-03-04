import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { createUserSchema } from "@/lib/user-schema";
import { ZodError } from "zod";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {

    const { name, email, password } = createUserSchema.parse(await req.json());

    const hashed_password = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        email: email.toLowerCase(),
        password: hashed_password,
      },
    });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          status: "fail",
          message: "user with that email already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
