import React, { useEffect, useState } from "react";
import Link from "next/link";
import HitTestComponent from "../../components/HitTest/HitTest";

function HitTestPage() {
  return (
    <>
      <Link href={"/"} style={{ fontSize: "2rem", color: "#000" }}>
        home
      </Link>
      <HitTestComponent />
    </>
  );
}

export default HitTestPage;
