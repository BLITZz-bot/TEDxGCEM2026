import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  // Only allow code modifications in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production mode" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { desktop, mobile, opacity, themeYearSize } = body;

    // Check parameter types
    if (
      !desktop || typeof desktop.x !== "number" || typeof desktop.y !== "number" || typeof desktop.scale !== "number" ||
      !mobile || typeof mobile.x !== "number" || typeof mobile.y !== "number" || typeof mobile.scale !== "number" ||
      typeof opacity !== "number" || typeof themeYearSize !== "number"
    ) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "src", "components", "sections", "Hero.tsx");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Hero.tsx file not found" }, { status: 404 });
    }

    let content = fs.readFileSync(filePath, "utf-8");

    // Match the useState declaration for bgSettings, allowing for generic <BgSettings>
    const regex = /(const\s+\[bgSettings,\s+setBgSettings\]\s*=\s*React\.useState(?:<[^>]+>)?\(\{)([\s\S]*?)(\}\);)/;
    
    if (!regex.test(content)) {
      return NextResponse.json({ error: "Could not locate bgSettings state declaration in Hero.tsx" }, { status: 400 });
    }

    // Replace state with formatting for all settings
    const replacement = `$1\n    desktop: {\n      x: ${desktop.x},\n      y: ${desktop.y},\n      scale: ${parseFloat(desktop.scale.toFixed(2))}\n    },\n    mobile: {\n      x: ${mobile.x},\n      y: ${mobile.y},\n      scale: ${parseFloat(mobile.scale.toFixed(2))}\n    },\n    opacity: ${opacity},\n    themeYearSize: ${themeYearSize}\n  $3`;
    
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
